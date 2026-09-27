import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar({ length: 20 }).notNull().default("CAISSIER"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const categories = pgTable("categories", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  color: varchar({ length: 7 }).default("#6366f1"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: varchar({ length: 200 }).notNull(),
  sku: varchar({ length: 50 }).notNull().unique(),
  barcode: varchar({ length: 100 }).unique(),
  description: text(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull().default("0"),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const customers = pgTable("customers", {
  id: serial().primaryKey(),
  name: varchar({ length: 150 }).notNull(),
  phone: varchar({ length: 20 }).unique(),
  email: varchar({ length: 255 }).unique(),
  address: text(),
  notes: text(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial().primaryKey(),
  saleNumber: varchar("sale_number", { length: 30 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  customerId: integer("customer_id").references(() => customers.id),
  subtotal: numeric({ precision: 12, scale: 2 }).notNull(),
  discount: numeric({ precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric({ precision: 12, scale: 2 }).notNull(),
  amountReceived: numeric("amount_received", { precision: 12, scale: 2 }).notNull(),
  changeAmount: numeric("change_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("CASH"),
  status: varchar({ length: 20 }).notNull().default("COMPLETED"),
  notes: varchar({ length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: serial().primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer().notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric({ precision: 12, scale: 2 }).notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: serial().primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  movementType: varchar("movement_type", { length: 20 }).notNull(),
  quantity: integer().notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  reason: text(),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar({ length: 100 }).notNull(),
  entity: varchar({ length: 100 }).notNull(),
  entityId: integer("entity_id"),
  description: text(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyArchives = pgTable(
  "monthly_archives",
  {
    id: serial().primaryKey(),
    year: integer().notNull(),
    month: integer().notNull(),
    monthName: varchar("month_name", { length: 20 }).notNull(),
    totalSales: numeric("total_sales", { precision: 12, scale: 2 }).default("0"),
    totalProfit: numeric("total_profit", { precision: 12, scale: 2 }).default("0"),
    totalPaid: numeric("total_paid", { precision: 12, scale: 2 }).default("0"),
    transactionCount: integer("transaction_count").default(0),
    productsSold: integer("products_sold").default(0),
    categoryBreakdownJson: varchar("category_breakdown_json", { length: 2000 }).default("{}"),
    archivedAt: timestamp("archived_at").defaultNow(),
  },
  (table) => [uniqueIndex("uq_archive_year_month").on(table.year, table.month)],
);
