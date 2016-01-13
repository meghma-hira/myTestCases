/**
 * Created by hippo-innovations on 13/1/16.
 */
/**
 * Created by hippo-innovations on 12/1/16.
 */


var prompt = require("prompt");
var assert = require('assert');

var storehippo = require('storehippo-nodejs-sdk')({
    storename: "atishaydemo2",
    access_key: "admin",
    version: "1.0"
});

//todo test cases for checkdeliveryavailbility

//PROMPTING PINCODE
//CHECKING PINCODE LENGTH
//CHECKING DELIVERYAVAILABILITY ("both" or "COD not available")


describe('1. checkDeliveryAvailability for a given PINCODE', function () {

    this.timeout(1000000);

    before(function (done) {

        done();
    });

    beforeEach(function (done) {
        //An action to be performed before each test case
        done();
    });

    it('Checking deliveryAvailability', function (done) {
     prompt.start();

     prompt.get(['pincode'], function (err, result) {

     var request = {
     entity: "ms.fulfillment",
     data: {pincode: result.pincode}
     };

     //console.log(request.data.pincode.length);
     assert.equal(request.data.pincode.length, 6, "PINCODE is INVALID")


     storehippo.call("checkDeliveryAvailability", request, function (err, response) {
     if (err) throw err;
     //console.log(response);
     var res = JSON.parse(response.data);
     console.log("SERVICE AVAILABLE at ", request.data.pincode, "is: ", res.data);

     assert.equal(200, response.status, "ERROR");

     assert.equal("both", res.data, "COD SERVICE NOT AVAILABLE");

     done();

     });
     });

     });
});


//todo test cases for shippo level 2 for different combintation of services like delhivery,aramex, fedex and combinations of three of them

//7 TEST-CASES for different combinations for services: DELHIVERY, ARAMEX and FEDEX

describe('2. ms.fulfillment Test Cases for different combination of services', function () {

    this.timeout(1000000);
    var getorder;
    var order;
    var getadd;
    var pickup;

    before(function (done) {

        getorder = {
            entity: "ms.orders",
            query  : {
                filters: [{field : "order_id", value : "OID294"}]
            }
        };

        storehippo.list(getorder, function (err, response) {
            if (err) throw err;

            assert.equal(response.status, 200, "storehippo.list on ms.order, response.status != 200");

            var orderList = JSON.parse(response.data);
            order = orderList.data[0];

            getadd = {
                entity: "ms.orders"
            };

            storehippo.call("getAddresses", getadd, function (err, res) {
                if (err) throw err;

                assert.equal(res.status, 200, "getAddresses on ms.orders, response.status != 200");

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

    it("Checking for DELHIVERY", function(done){

        var services=['delhivery'];
        var expected_rates_titles = ['delhivery'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for ARAMEX", function(done){

        var services=['aramex'];
        var expected_rates_titles = ['aramex'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for FEDEX", function(done){

        var services=['fedex'];
        var expected_rates_titles = ['standard_overnight', 'fedex_express_saver'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for DELHIVERY and ARAMEX", function(done){

        var services=['delhivery', 'aramex'];
        var expected_rates_titles = ['delhivery', 'aramex'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for DELHIVERY and FEDEX", function(done){

        var services=['delhivery', 'fedex'];
        var expected_rates_titles = ['delhivery', 'standard_overnight', 'fedex_express_saver'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for ARAMEX and FEDEX", function(done){

        var services=['aramex', 'fedex'];
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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

    it("Checking for DELHIVERY, ARAMEX and FEDEX", function(done){

        var services=['delhivery', 'aramex', 'fedex'];
        var expected_rates_titles = ['delhivery', 'aramex', 'standard_overnight', 'fedex_express_saver'];

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

            var update_msg = JSON.parse(res.data);

            assert.equal(res.status, 200, "storehippo.update on ms.fulfillment_methods, response.status != 200");
            assert.equal(update_msg.data, 'updated successfully', "Services in ms.fulfillment_methods NOT updated");

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

                    rates.data.forEach(function(item){

                        available_rate_titles.push(item.title.toLowerCase()); //creating array of available rate_title
                    });

                    expected_rates_titles.forEach(function (item) {

                        //Checking if rates are available for each services
                        //Comparing available rates with expected array of rates titles rates_titles
                        assert.notEqual(available_rate_titles.indexOf(item), -1, "rates are NOT available for each services");
                    });

                    done();
                });

            });
        });
    });

});

//todo check that rates are available for pincodes where delivery is available.

//Taking 10 ORDERS from ms.orders
//Retrieving zipcode of shipping_address for each order
//Checking deliveryAvailability for each zipcode
//Displaying rates for each corresponding order

describe('3. Test Cases for getting RATES when DELIVERY at PINCODES of Shipping Address are AVAILABLE ', function () {

    this.timeout(1000000);

    before(function (done) {

        done();
    });

    beforeEach(function (done) {
        //An action to be performed before each test case
        done();
    });

    it('Checking Delivery at PINCODES and fetching corresponding available RATES ', function (done) {

        var getOrder = {
            entity : "ms.orders",

            query  : {
                start: 0,
                limit: 10
            }

        };
        var limit = 9;

        storehippo.list(getOrder, function (err, response) {
            if (err) throw err;

            assert.equal(response.status, 200, "storehippo.list on ms.order, response.status != 200");

            var orderList = JSON.parse(response.data);
            order = orderList.data[0];

            getadd = {
                entity: "ms.orders"
            };

            storehippo.call("getAddresses", getadd, function (err, res) {
                if (err) throw err;

                assert.equal(res.status, 200, "getAddresses on ms.orders, response.status != 200");

                var pickup_res = JSON.parse(res.data);

                var pickup = pickup_res.data;

                var getmethod = {
                    entity: "ms.fulfillment"
                };

                storehippo.call("getMethods", getmethod, function (err, res) {
                    if (err) throw err;

                    assert.equal(res.status, 200, "getMethods on ms.fulfillment, response.status != 200");

                    var methods = JSON.parse(res.data);

                    orderList.data.forEach(function(item, index){

                        var getrate = {
                            entity: "ms.fulfillment",
                            data: {
                                level: methods.data[0].shipping_level,
                                method: methods.data[0].provider,
                                orderDetail: item,
                                pickupAddress: pickup[0]
                            }
                        };

                        var request = {
                            entity : "ms.fulfillment",
                            data: {pincode: item.billing_address.zip}
                        };


                        storehippo.call("checkDeliveryAvailability", request, function(err, response) {
                            if (err) throw err;

                            var checkDeliveryAvailability = JSON.parse(response.data);

                            assert.equal(response.status, 200, "checkDeliveryAvailability on PINCODE, response.status != 200");
                            assert.equal(checkDeliveryAvailability.data, "both", "COD SERVICE NOT AVAILABLE");


                            storehippo.call("getRates", getrate, function (err, res) {
                                if (err) throw err;

                                assert.equal(res.status, 200, "getRates on ms.fulfillments, response.status != 200");

                                if(index==limit){
                                    done();
                                }

                            });
                        });
                    });
                });
            });

        });

    });

});

