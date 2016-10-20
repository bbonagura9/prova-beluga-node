'use strict';

var async			= require('async');
var mysql			= require('mysql');
var fs 				= require('fs');
var csv_stringify 	= require('csv-stringify');

async.autoInject({
	db_connect: (callback) => {
		var connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : '',
		  password : '',
		  database : ''
		});

		connection.connect();

		callback(null, connection);
	},
	db_query: (db_connect, callback) => {
		var q = `
			SELECT
				fs.sales,
				fs.at_stamp,
				dc.name customer_name,
				ds.name supplier_name,
				dl.name location_name,
				DATE_FORMAT(dd.at, '%Y-%m-%d') datestamp,
				dp.name product_name
			FROM fact_sales fs
			LEFT JOIN dim_customer dc
				ON dc.id = fs.customer
			LEFT JOIN dim_supplier ds
				ON ds.id = fs.supplier
			LEFT JOIN dim_location dl
				ON dl.id = fs.location
			LEFT JOIN dim_date dd 
				ON dd.at = fs.at
			LEFT JOIN dim_product dp
				ON dp.id = fs.product
			ORDER BY
				fs.at_stamp DESC`;
		db_connect.query(q, (err, rows, fields) => {
			if (err) callback(err, null);
			callback(null, {rows, fields});
		});
	},
	db_close: (db_connect, db_query, callback) => {
		db_connect.end();
		callback(null, null);
	},
	csv_generate: (db_query, callback) => {
		csv_stringify(
			db_query.rows, 
			{
				header: true, 
				columns: db_query.fields.map(v => v.name), 
				quotedString: true
			}, 
			function(err, output){
				callback(null, output);
			}
		);
	},
	csv_print: (csv_generate, callback) => {
		fs.writeFile("./sales.csv", csv_generate, function(err) {
			if(err) {
				callback(err, null);
			}

			console.log("The file sales.csv was saved!");
		}); 
	},
}, function(err, results) {
	console.error('err = ', err);
});