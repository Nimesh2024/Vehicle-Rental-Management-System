import db from '../db.js';

export const ReportModel = {
    /**
     * Get branch performance metrics via BranchPerformanceView
     */
    async getBranchPerformance() {
        const [rows] = await db.query('SELECT * FROM BranchPerformanceView');
        return rows;
    },

    /**
     * Generates a specific branch report using Stored Procedure GenerateBranchReport
     */
    async generateBranchReport(branchId) {
        const [results] = await db.query('CALL GenerateBranchReport(?)', [branchId]);
        return results[0] || [];
    },

    /**
     * Get maintenance cost summary per vehicle via MaintenanceCostView
     */
    async getMaintenanceCostSummary() {
        const [rows] = await db.query('SELECT * FROM MaintenanceCostView');
        return rows;
    },

    /**
     * Comprehensive Executive KPI & Reporting Analytics (Daily, Monthly, Yearly, All-Time)
     */
    async getExecutiveAnalytics({ period = 'all', date, month, year } = {}) {
        const todayStr = new Date().toISOString().split('T')[0];
        const thisMonthStr = todayStr.slice(0, 7);
        const thisYearStr = String(new Date().getFullYear());

        let targetPeriod = period || 'all';
        let selectedLabel = 'All Time Platform Report';
        let dateCondition = '1=1';
        let queryParams = [];

        if (period === 'day') {
            const targetDate = date || todayStr;
            selectedLabel = `Daily Report: ${targetDate}`;
            dateCondition = 'DATE(COALESCE(p.PaymentDate, r.RentalDate)) = ?';
            queryParams = [targetDate];
        } else if (period === 'month') {
            const targetMonth = month || thisMonthStr;
            selectedLabel = `Monthly Report: ${targetMonth}`;
            dateCondition = "DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m') = ?";
            queryParams = [targetMonth];
        } else if (period === 'year') {
            const targetYear = year || thisYearStr;
            selectedLabel = `Annual Report: ${targetYear}`;
            dateCondition = 'YEAR(COALESCE(p.PaymentDate, r.RentalDate)) = ?';
            queryParams = [targetYear];
        }

        // 1. Current Real-time Platform Status
        const [customersCount] = await db.query('SELECT COUNT(*) as count FROM ActiveCustomerView');
        const [vehiclesCount] = await db.query('SELECT COUNT(*) as count FROM AvailableVehiclesView');
        const [allVehiclesCount] = await db.query('SELECT COUNT(*) as count FROM Vehicles');
        const [ongoingRentalsCount] = await db.query('SELECT COUNT(*) as count FROM ActiveRentalsView');
        const [inMaintenanceCount] = await db.query(
            "SELECT COUNT(*) as count FROM VehicleMaintenanceView WHERE MaintenanceStatus = 'In_Progress'"
        );
        const [totalPlatformRev] = await db.query(
            "SELECT IFNULL(SUM(Amount), 0) as total FROM Payments WHERE PaymentStatus = 'Completed'"
        );

        // 2. Period-filtered Summary (Revenue, Rentals, Bookings, Fines)
        const [periodRevenue] = await db.query(
            `SELECT 
                IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS settledRevenue,
                IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Pending' THEN p.Amount ELSE 0 END), 0) AS pendingRevenue,
                COUNT(DISTINCT r.RentalID) AS totalRentals,
                COUNT(DISTINCT CASE WHEN r.RentalStatus = 'Completed' THEN r.RentalID END) AS completedRentals,
                COUNT(DISTINCT CASE WHEN r.RentalStatus = 'Ongoing' THEN r.RentalID END) AS ongoingRentals,
                COUNT(DISTINCT b.BookingID) AS totalBookings
             FROM Rentals r
             JOIN Bookings b ON r.BookingID = b.BookingID
             LEFT JOIN Payments p ON r.RentalID = p.RentalID
             WHERE ${dateCondition}`,
            queryParams
        );

        const [periodFines] = await db.query(
            `SELECT 
                IFNULL(SUM(f.Amount), 0) AS totalFines,
                COUNT(f.FineID) AS fineCount
             FROM Fines f
             JOIN Rentals r ON f.RentalID = r.RentalID
             LEFT JOIN Payments p ON r.RentalID = p.RentalID
             WHERE ${dateCondition}`,
            queryParams
        );

        // 3. Time Series for Graphs
        let timeSeries = [];
        if (period === 'day') {
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m-%d') AS label,
                    IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS revenue,
                    COUNT(DISTINCT r.RentalID) AS rentalCount
                FROM Rentals r
                LEFT JOIN Payments p ON r.RentalID = p.RentalID
                WHERE COALESCE(p.PaymentDate, r.RentalDate) >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                GROUP BY label
                ORDER BY label ASC
            `);
            timeSeries = rows;
        } else if (period === 'month') {
            const targetMonth = month || thisMonthStr;
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m-%d') AS label,
                    IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS revenue,
                    COUNT(DISTINCT r.RentalID) AS rentalCount
                FROM Rentals r
                LEFT JOIN Payments p ON r.RentalID = p.RentalID
                WHERE DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m') = ?
                GROUP BY label
                ORDER BY label ASC
            `, [targetMonth]);
            timeSeries = rows;
        } else if (period === 'year') {
            const targetYear = year || thisYearStr;
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m') AS label,
                    IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS revenue,
                    COUNT(DISTINCT r.RentalID) AS rentalCount
                FROM Rentals r
                LEFT JOIN Payments p ON r.RentalID = p.RentalID
                WHERE YEAR(COALESCE(p.PaymentDate, r.RentalDate)) = ?
                GROUP BY label
                ORDER BY label ASC
            `, [targetYear]);
            timeSeries = rows;
        } else {
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(COALESCE(p.PaymentDate, r.RentalDate), '%Y-%m') AS label,
                    IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS revenue,
                    COUNT(DISTINCT r.RentalID) AS rentalCount
                FROM Rentals r
                LEFT JOIN Payments p ON r.RentalID = p.RentalID
                GROUP BY label
                ORDER BY label ASC
            `);
            timeSeries = rows;
        }

        // 4. Branch Breakdown
        const [branchBreakdown] = await db.query(`
            SELECT 
                b.BranchID, 
                b.BranchName, 
                b.Location,
                COUNT(DISTINCT v.VehicleID) AS FleetCount,
                COUNT(DISTINCT bk.BookingID) AS TotalBookings,
                COUNT(DISTINCT r.RentalID) AS TotalRentals,
                IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS TotalRevenue
            FROM Branches b
            LEFT JOIN Vehicles v ON b.BranchID = v.BranchID
            LEFT JOIN Bookings bk ON v.VehicleID = bk.VehicleID
            LEFT JOIN Rentals r ON bk.BookingID = r.BookingID
            LEFT JOIN Payments p ON r.RentalID = p.RentalID
            GROUP BY b.BranchID, b.BranchName, b.Location
            ORDER BY TotalRevenue DESC
        `);

        // 5. Category Breakdown
        const [categoryBreakdown] = await db.query(`
            SELECT 
                c.CategoryID, 
                c.CategoryName, 
                c.DailyRate, 
                COUNT(DISTINCT v.VehicleID) AS VehicleCount,
                COUNT(DISTINCT bk.BookingID) AS TotalBookings,
                IFNULL(SUM(CASE WHEN p.PaymentStatus = 'Completed' THEN p.Amount ELSE 0 END), 0) AS TotalRevenue
            FROM VehicleCategories c
            LEFT JOIN Vehicles v ON c.CategoryID = v.CategoryID
            LEFT JOIN Bookings bk ON v.VehicleID = bk.VehicleID
            LEFT JOIN Rentals r ON bk.BookingID = r.BookingID
            LEFT JOIN Payments p ON r.RentalID = p.RentalID
            GROUP BY c.CategoryID, c.CategoryName, c.DailyRate
            ORDER BY TotalRevenue DESC
        `);

        // 6. Fleet Status Distribution
        const [fleetStatusRows] = await db.query(`
            SELECT Status, COUNT(*) AS count
            FROM Vehicles
            GROUP BY Status
        `);

        // 7. Payment Methods Breakdown
        const [paymentMethods] = await db.query(`
            SELECT PaymentMethod, COUNT(*) AS count, IFNULL(SUM(Amount), 0) AS total
            FROM Payments
            WHERE PaymentStatus = 'Completed'
            GROUP BY PaymentMethod
        `);

        // 8. Detailed Report Ledger (filtered by period)
        const [ledger] = await db.query(`
            SELECT 
                r.RentalID,
                b.BookingID,
                CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
                c.Phone AS CustomerPhone,
                CONCAT(v.Make, ' ', v.Model, ' (', v.RegistrationNumber, ')') AS VehicleInfo,
                vc.CategoryName,
                br.BranchName,
                r.ActualStartDate,
                r.ActualEndDate,
                r.RentalStatus,
                p.PaymentID,
                IFNULL(p.Amount, 0) AS Amount,
                IFNULL(p.PaymentMethod, 'Unpaid') AS PaymentMethod,
                IFNULL(p.PaymentStatus, 'Pending') AS PaymentStatus,
                p.PaymentDate,
                IFNULL((SELECT SUM(f.Amount) FROM Fines f WHERE f.RentalID = r.RentalID), 0) AS TotalFines
            FROM Rentals r
            JOIN Bookings b ON r.BookingID = b.BookingID
            JOIN Customers c ON b.CustomerID = c.CustomerID
            JOIN Vehicles v ON b.VehicleID = v.VehicleID
            JOIN VehicleCategories vc ON v.CategoryID = vc.CategoryID
            JOIN Branches br ON v.BranchID = br.BranchID
            LEFT JOIN Payments p ON r.RentalID = p.RentalID
            WHERE ${dateCondition}
            ORDER BY r.RentalID DESC
        `, queryParams);

        const totalFleet = allVehiclesCount[0]?.count || 1;
        const activeRentals = ongoingRentalsCount[0]?.count || 0;
        const utilizationRate = Number(((activeRentals / totalFleet) * 100).toFixed(1));

        return {
            period: targetPeriod,
            periodLabel: selectedLabel,
            realtime: {
                activeCustomers: customersCount[0]?.count || 0,
                availableVehicles: vehiclesCount[0]?.count || 0,
                totalVehicles: totalFleet,
                ongoingRentals: activeRentals,
                inMaintenance: inMaintenanceCount[0]?.count || 0,
                totalPlatformRevenue: totalPlatformRev[0]?.total || 0,
                utilizationRate
            },
            summary: {
                settledRevenue: periodRevenue[0]?.settledRevenue || 0,
                pendingRevenue: periodRevenue[0]?.pendingRevenue || 0,
                totalRentals: periodRevenue[0]?.totalRentals || 0,
                completedRentals: periodRevenue[0]?.completedRentals || 0,
                ongoingRentals: periodRevenue[0]?.ongoingRentals || 0,
                totalBookings: periodRevenue[0]?.totalBookings || 0,
                totalFines: periodFines[0]?.totalFines || 0,
                fineCount: periodFines[0]?.fineCount || 0,
                averageRentalValue: periodRevenue[0]?.totalRentals > 0 
                    ? Number((periodRevenue[0].settledRevenue / periodRevenue[0].totalRentals).toFixed(2)) 
                    : 0
            },
            timeSeries,
            branchBreakdown,
            categoryBreakdown,
            fleetStatusBreakdown: fleetStatusRows,
            paymentMethods,
            ledger
        };
    }
};

export default ReportModel;
