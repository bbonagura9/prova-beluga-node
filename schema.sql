
DROP TABLE IF EXISTS dim_customer;
CREATE TABLE dim_customer (
	id INT NOT NULL,
	name CHAR(32) NOT NULL,
	PRIMARY KEY(id)
);

DROP TABLE IF EXISTS dim_supplier;
CREATE TABLE dim_supplier (
	id INT NOT NULL,
	name CHAR(32) NOT NULL,
	PRIMARY KEY(id)
);

DROP TABLE IF EXISTS dim_location;
CREATE TABLE dim_location (
	id INT NOT NULL,
	name CHAR(32) NOT NULL,
	PRIMARY KEY(id)
);

DROP TABLE IF EXISTS dim_date;
CREATE TABLE dim_date (
	at DATE NOT NULL,
	PRIMARY KEY(at)
);

DROP TABLE IF EXISTS dim_product;
CREATE TABLE dim_product (
	id INT NOT NULL,
	name CHAR(32) NOT NULL,
	PRIMARY KEY(id)
);

DROP TABLE IF EXISTS fact_sales;
CREATE TABLE fact_sales (
	sales INT NOT NULL,
	customer INT,
	supplier INT,
	location INT,
	at DATE,
	product INT,
	at_stamp CHAR(20),
	INDEX (customer),
	INDEX (supplier),
	INDEX (location),
	INDEX (at),
	INDEX (product),
	FOREIGN KEY (customer)
		REFERENCES dim_customer(id)
		ON DELETE RESTRICT,
	FOREIGN KEY (supplier)
		REFERENCES dim_supplier(id)
		ON DELETE RESTRICT,
	FOREIGN KEY (location)
		REFERENCES dim_location(id)
		ON DELETE RESTRICT,
	FOREIGN KEY (at)
		REFERENCES dim_date(at)
		ON DELETE RESTRICT,
	FOREIGN KEY (product)
		REFERENCES dim_product(id)
		ON DELETE RESTRICT,
	PRIMARY KEY(customer, supplier, location, at, product)
);