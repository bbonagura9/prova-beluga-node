'use strict';

const async           = require('async');
const mysql           = require('mysql');
const fs              = require('fs');
const csv_stringify   = require('csv-stringify');

async.autoInject({
    /*
        Intializes database connection
    */
    db_connect: (callback) => {
        var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'beluga',
          password : 'beluga',
          database : 'beluga_node'
        });

        connection.connect();

        callback(null, connection);
    },

    /*
        Open the output csv file and pipe a csv stringify to it
    */
    csv_open: (callback) => {
        var fstream = fs.createWriteStream('sales.csv', {autoClose: true});
        var cstream = csv_stringify({quotedString: true});
        cstream.pipe(fstream);

        callback(null, cstream);
    },

    /* 
        Executes query and pipes the output to the stringifier
        Pipeline diagram:
            query ---> csv_stringify ---> fs.WriteStream
    */
    db_query: (db_connect, csv_open, callback) => {
        var query = db_connect.query(`
            SELECT
                fs.sales,
                fs.at_stamp,
                dc.name customer_name,
                ds.name supplier_name,
                dl.name location_name,
                DATE_FORMAT(dd.at, '%Y-%m-%d') date_at,
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
                fs.at_stamp DESC`)
        .on('error', function(err) {
            callback(err, null);
        })
        .on('fields', function(fields) {
            csv_open.write(fields.map((v) => v.name));
        })
        .on('end', function() {
            callback(null, null);
        })
        .stream()
        .pipe(csv_open);
    },
    /*
        Closes the database connection
    */
    db_close: (db_connect, db_query, callback) => {
        db_connect.end(function(err) {
            if(err) callback(err, null);
        });
    },
    /*
        Closes the stringifier pipe
    */
    csv_close: (db_query, csv_open, callback) => {
        csv_open.end(function(err) {
            if(err) callback(err, null);
        });
    }
}, function(err, results) {
    console.log('err = ', err);
});