/**
 * Created by hippo-innovations on 13/1/16.
 */

var prompt = require("prompt");
var assert = require('assert');

var storehippo = require('storehippo-nodejs-sdk')({
    storename: "atishaydemo2",
    access_key: "admin",
    version: "1.0"
});


describe('ms.fulfillment Test Cases', function () {

    var order;

    this.timeout(1000000);
    var getorder;
    var order;
    var getadd;
    var pickup;
    var zip;


    before(function (done) {

        getorder = {
            entity: "ms.orders",
            query: {
                filters: [{field: "order_id", value: "OID259"}]
            }
        };

        storehippo.list(getorder, function (err, response) {
            if (err) throw err;

            assert.equal(response.status, 200, "storehippo.list on ms.orders, response.status != 200");

            var orderList = JSON.parse(response.data);
            order = orderList.data[0];
            //order.shipping_address.zip = "123231";
            zip = order.shipping_address.zip;

            getadd = {
                entity: "ms.orders"
            };

            storehippo.call("getAddresses", getadd, function (err, res) {
                if (err) throw err;

                var pickup_res = JSON.parse(res.data);
                pickup = pickup_res.data;

                done();
            });
        });
    });


    beforeEach(function (done) {
        //An action to be performed before each test case
        done();
    });

    it("Checking for ARAMEX and FEDEX", function (done) {

        var services = ['aramex', 'fedex'];
        var expected_rates_titles = ['aramex', 'standard_overnight', 'fedex_express_saver'];

        //upadate ms.fulfillments_methods here

        var updateFulfillment = {
            entity: "ms.fulfillment_methods",
            recordId: '552272ab24f621aa2373a5d8',
            data: {
                settings: {
                    services: services
                }
            }
        };

        storehippo.update(updateFulfillment, function (err, res) {
            if (err) throw err;

            var update_res = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_res.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

            var getmethod = {
                entity: "ms.fulfillment"
            };

            storehippo.call("getMethods", getmethod, function (err, res) {
                if (err) throw err;

                assert.equal(res.status, 200, "getMethods on ms.fulfillment, response.status != 200");

                var methods = JSON.parse(res.data);

                methods.data[0].settings.services.forEach(function (item) {
                    assert.notEqual(services.indexOf(item), -1, "services != methods[0].settings.services");
                });

                var getrate = {
                    entity: "ms.fulfillment",

                    data: {
                        level: methods.data[0].shipping_level,
                        method: methods.data[0].provider,
                        orderDetail: order,
                        pickupAddress: pickup[0]
                    }
                };

                storehippo.call("getRates", getrate, function (err, res) {
                    if (err) throw err;

                    assert.equal(res.status, 200, "getRates on ms.fulfillments, response.status != 200");

                    var rates = JSON.parse(res.data);

                    assert.notEqual(rates.data.message, "Logistics service not available !!!", "Method: getRates, response.data.message = Logistics service not available !!!");

                    var available_rate_titles = [];

                    rates.data.forEach(function (item) {

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    var missed_rate_titles = [];

                    expected_rates_titles.forEach(function (item) {

                        if (available_rate_titles.indexOf(item) == -1) {
                            missed_rate_titles.push(item); //array of services for which rates not available
                        }

                    });


                    missed_rate_titles.forEach(function (item) {

                        //Comparing available rates with expected array of rates titles rates_titles
                        //not really required

                        assert.equal(available_rate_titles.indexOf(item), -1, "rates are available for each services");

                        var request = {
                            entity: "ms.fulfillment",
                            data: {
                                pincode: zip
                            }
                        };

                        assert.equal(request.data.pincode.length, 6, "PINCODE is INVALID");

                        storehippo.call("checkDeliveryAvailability", request, function (err, response) {
                            if (err) throw err;

                            var checkDeliveryAvailability = JSON.parse(response.data);

                            assert.equal(res.status, 200, "checkDeliveryAvailability on PINCODE, response.status != 200");
                            assert.equal(checkDeliveryAvailability.data, "both", "COD SERVICE NOT AVAILABLE");

                            done();

                        });
                    });
                });
            });
        });
    });
});





