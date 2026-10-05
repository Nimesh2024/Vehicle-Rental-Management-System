# Vehicle Rental Management System - Project Breakdown

## Global Database Architecture
The database is structured to support all 5 modules collaboratively without violating normal forms. The core schema contains **15 tables**: `Roles`, `Users`, `Branches`, `Customers`, `Employees`, `AuditLogs`, `VehicleCategories`, `Vehicles`, `VehicleStatusHistory`, `Bookings`, `Rentals`, `Payments`, `Fines`, `Maintenance`, and `BranchTransfers`.

**Advanced DBMS Concepts Applied by EVERY Member:** Views, UDFs, Stored Procedures, Error Handling, Indexes, Triggers, Events, and Transactions (COMMIT/ROLLBACK).

---

## Member 1 – Customer Management
**Responsibilities:** Customer registration, profile management, verification, and rental history tracking.

- **Views:** `CustomerRentalHistoryView`, `ActiveCustomerView`
- **UDFs:** `CustomerAge()`, `CustomerRentalCount()`
- **Stored Procedures:** `RegisterCustomer()`, `UpdateCustomer()`
- **Error Handling Implementation:** Duplicate phone/email detection, invalid customer data rollback, invalid customer ID checks.
- **Indexes:** `idx_customer_phone`, `idx_customer_email`, `idx_customer_nic`
- **Triggers:** `AfterCustomerInsert` (Customer audit logging), `AfterCustomerUpdateStatus` (Customer status update log).
- **Events:** `MaintainCustomerStatus` (Customer account/status maintenance for defaulting customers).
- **Transactions:** Handled inside `RegisterCustomer()` (Customer registration + User creation).

---

## Member 2 – Vehicle Management
**Responsibilities:** Vehicle registration, status tracking, category pricing, and branch allocation.

- **Views:** `AvailableVehiclesView`, `BranchVehicleView`
- **UDFs:** `VehicleAge()`, `CalculateVehicleRentalRate()`
- **Stored Procedures:** `AddVehicle()`, `UpdateVehicleStatus()`
- **Error Handling Implementation:** Duplicate registration number, invalid vehicle category constraint failures, invalid vehicle status string traps.
- **Indexes:** Registration number, Vehicle category, Vehicle status.
- **Triggers:** `AutoVehicleStatusLog` (Automatic vehicle status changes), `VehicleAuditLog` (Vehicle audit log).
- **Events:** `IdentifyMaintenanceVehicles` (Identify vehicles requiring maintenance based on mileage/time).
- **Transactions:** Handled inside `AddVehicle()` (Add/update vehicle + branch allocation).

---

## Member 3 – Rental & Booking Management
**Responsibilities:** Booking management, rental creation, cancellation, and rental tracking.

- **Views:** `ActiveRentalsView`, `CustomerBookingView`
- **UDFs:** `CalculateRentalDays()`, `CalculateRentalCost()`
- **Stored Procedures:** `CreateRental()`, `CancelRental()`, `ConfirmBooking()`
- **Error Handling Implementation:** Vehicle unavailable checks, invalid rental dates check, duplicate booking prevention, invalid customer/vehicle rollbacks.
- **Indexes:** Rental date, Customer ID, Vehicle ID, Rental status.
- **Triggers:** `AfterRentalInsert_VehicleStatus` (Change vehicle status when rented), `AfterRentalUpdate_Status` (Automatically update rental status).
- **Events:** `DetectOverdueRentalsEvent` (Detect overdue rentals and automatically update overdue rental status).
- **Transactions:** Handled inside `CreateRental()` (Create rental + allocate vehicle + payment record).

---

## Member 4 – Payment, Return & Fine Management
**Responsibilities:** Processing payments, handling vehicle return calculations, applying late/damage fines, and handling refunds.

- **Views:** `PaymentSummaryView`, `OutstandingPaymentView`, `CustomerFineView`
- **UDFs:** `CalculateFine()`, `CalculateLateDays()`, `CalculateFinalBill()`
- **Stored Procedures:** `ProcessPayment()`, `ProcessVehicleReturn()`, `ProcessRefund()`
- **Error Handling Implementation:** Invalid payment amount checks, duplicate payment block, invalid rental block, payment failure rollback, invalid return trap.
- **Indexes:** Payment ID, Rental ID, Payment date, Payment status.
- **Triggers:** `AfterPaymentUpdate_RentalStatus` (Update payment status log), `AfterRentalReturn_UpdateVehicle` (Update rental status/vehicle after payment/return).
- **Events:** `GenerateOverduePaymentRecords` (Find unpaid/overdue payments and generate overdue payment records).
- **Transactions:** Handled inside `ProcessVehicleReturn()` and `ProcessPayment()` (Vehicle return + fine calculation + payment update).

---

## Member 5 – Maintenance, Branch & Reporting
**Responsibilities:** Maintaining vehicles, logging service records, tracking costs, and generating business logic reports.

- **Views:** `VehicleMaintenanceView`, `BranchPerformanceView`, `MaintenanceCostView`
- **UDFs:** `CalculateMaintenanceCost()`, `CalculateVehicleUtilization()`
- **Stored Procedures:** `AddMaintenanceRecord()`, `UpdateMaintenanceStatus()`, `GenerateBranchReport()`
- **Error Handling Implementation:** Invalid vehicle lookup, invalid maintenance date rollback, invalid maintenance cost check, duplicate maintenance record trap.
- **Indexes:** Vehicle ID, Maintenance date, Branch ID, Maintenance status.
- **Triggers:** `ChangeVehToMaintenance` (Change vehicle status to MAINTENANCE), `ChangeVehToAvailable` (Change vehicle status back to AVAILABLE after maintenance).
- **Events:** `GeneratePeriodicMaintenance` (Find vehicles due for maintenance & generate periodic checks).
- **Transactions:** Handled inside `AddMaintenanceRecord()` and `UpdateMaintenanceStatus()` (Maintenance creation + vehicle status update).
