# Integrated Reservation, Sales, and Inventory Management System

This project includes reservations, POS sales, general inventory, and a vegetable inventory module with batch tracking.

## Vegetable inventory features
- Vegetable catalog with kg, g, piece, and bunch base units.
- Separate delivery batches with supplier, quantity, cost, received date, and expiry date.
- FEFO usage: stock is deducted from the earliest-expiring usable batch first.
- Partial usage: only the quantity used is deducted; the remaining quantity stays in the batch.
- Cut/opened batch tracking with a shortened expiry date for the remaining portion.
- Waste records for spoilage/rot, peeling, trimming, discarded portions, and other waste.
- Alerts for low stock, expiry within two days, and expired batches.

