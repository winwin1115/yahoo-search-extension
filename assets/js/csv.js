$(document).ready(function() {
    var products_url_array = [];
    var products_name_array = [];
    var products_price_array = [];
    var products_seller_array = [];
    var sell_arr = [];
    var sell_count = 1;
    var break_count = 0;
    var stop_count = 0;

    chrome.storage.local.get(['user_name', 'seller_id'], function(res) {
        if(res['user_name'] == undefined)
            location.href = 'login.html';
        else
        {
            var seller_id = res['seller_id'];
            if(seller_id)
            {
                var seller_array = seller_id.split(', ');
                var html_li = '<label class="desc">セラーID</label>\
                    <select class="chosen-select-no-single" name="seller_id" data-placeholder="セラーIDをを選択してください。" id="seller_id">\
                        <option value="all">すべて</option>';
                $.each(seller_array, function (i, item) {
                    html_li += "<option value='" + item + "'>" + item + "</option>";
                    sell_arr.push(item);
                });
                html_li += '</select>';
                $('.seller_div').html(html_li);

                $('select[name="seller_id"]').chosen({disable_search_threshold:10, width:"100%"});
            }
        }
    });

    $('.btn-search').on('click', function (e) {
        e.preventDefault();
        function sleep(milliseconds) {
            const date = Date.now();
            let currentDate = null;
            do {
                currentDate = Date.now();
            } while (currentDate - date < milliseconds);
        }
        products_url_array = [];
        products_name_array = [];
        products_price_array = [];
        products_seller_array = [];
        var keyword = $('#search').val();
        var order_id = $('#order_id').val();
        var count_id = $('#count_id').val();
        var seller_id = $('#seller_id').val();
        var min_price = $('#min_price').val();
        var max_price = $('#max_price').val();
        var black_word = $('#black_word').val();
        if(!black_word)
            black_word = 'a1b2c3pz3y2x1';
        var property_id = $('#property_id').val();

        var total_count = 0;
        if(!seller_id)
        {
            notify_func("セラーIDを選択してください！ セラーID追加はセラーID管理画面で出来ます。");
            return;
        }
        if(property_id.length == 0)
        {
            notify_func("出力項目を選択してください！");
            return;
        }

        var result_data = [];
        var rows_data = {};
        if(property_id.indexOf('all') != -1)
        {
            rows_data['ASIN'] = 'ASIN';
            rows_data['商品名(Amazon)'] = '商品名(Amazon)';
            rows_data['販売価格(Amazon)'] = '販売価格(Amazon)';
            rows_data['JANコード'] = 'JANコード';
            rows_data['商品名'] = '商品名';
            rows_data['販売価格'] = '販売価格';
            rows_data['セラーID'] = 'セラーID';
            rows_data['価格差'] = '価格差';
        }
        else
        {
            if(property_id.indexOf('asin') != -1)
                rows_data['ASIN'] = 'ASIN';
            if(property_id.indexOf('aname') != -1)
                rows_data['商品名(Amazon)'] = '商品名(Amazon)';
            if(property_id.indexOf('aprice') != -1)
                rows_data['販売価格(Amazon)'] = '販売価格(Amazon)';
            if(property_id.indexOf('jan') != -1)
                rows_data['JANコード'] = 'JANコード';
            if(property_id.indexOf('name') != -1)
                rows_data['商品名'] = '商品名';
            if(property_id.indexOf('price') != -1)
                rows_data['販売価格'] = '販売価格';
            if(property_id.indexOf('seller_id') != -1)
                rows_data['セラーID'] = 'セラーID';
            if(property_id.indexOf('price_diff') != -1)
                rows_data['価格差'] = '価格差';
        }
        result_data.push(rows_data);

        var delay = 70;
        var progress_width = 0;
        for(var k = 1; k <= 100; k++)
        {
            progress_width += 1;
            $(".progress-bar").delay(delay).animate({
                width: progress_width + '%'
            }, delay,
            function() {
                if ($(".progress-bar").text() == '99%') {
                    notify_sucess("CSV出力が完了されました。");
                }
            });
    
            $(".progress-bar").prop('Counter', 0).animate(
                {
                    Counter: progress_width
                },
                {
                    duration: delay,
                    // easing: 'swing',
                    step: function(now) {
                        $(".progress-bar").text(Math.ceil(now) + '%');
                    }
                }
            );
            
        }
        
        if(seller_id == 'all')
        {
            for (var j = 0; j < sell_arr.length; j++)
            {
                break_count = 0;
                products_url_array = [];
                products_name_array = [];
                products_price_array = [];
                products_seller_array = [];
                var url = "https://store.shopping.yahoo.co.jp/" + sell_arr[j] + "/search.html?p=" + keyword + "&X=" + order_id + "&n=100#CentSrchFilter1";
                $.ajax({
                    url: url,
                    type: 'GET',
                    async: false,
                    success: function (response) {
                        var dom_nodes = $($.parseHTML(response));

                        total_count = dom_nodes.find('.mdSearchHeader .elHeader .elHeaderTitle').text();
                        total_count = total_count.split('（')[1];
                        if(!total_count)
                        {
                            notify_func("検索結果がありません。");
                            return;
                        }                    
                        else
                        {
                            total_count = total_count.split('件')[0].replace(',', '');
                            total_count = total_count == '' ? 0 : total_count;
                            dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elImage a').each(function () {
                                var jan_code = $(this).attr('href');
                                products_url_array.push(jan_code);
                            });
                            
                            dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elName a span').each(function () {
                                products_name_array.push($(this).text());
                                products_seller_array.push(sell_arr[j]);
                            });
                            
                            dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elPrice .elPriceItem .elPriceValue').each(function () {
                                products_price_array.push($(this).text());
                            });
                        }
                    },
                    error: function () {
                        
                    }
                });
                if(total_count > count_id * 2)
                {
                    for(var i = 1; i <= count_id * 2 / 100; i++)
                        ajax_yahoo(sell_arr[j], keyword, order_id, i);
                }
                else
                {
                    for(var i = 1; i <= total_count / 100; i++)
                        ajax_yahoo(sell_arr[j], keyword, order_id, i);
                }

                var index = 0;
                var i = 0;
                while(index < count_id && i != products_name_array.length - 1)
                {
                    console.log(products_price_array[i], count_id, index);
                    var price = 0;
                    if(products_price_array[i])
                        price = products_price_array[i].replace(/円/g, '').replace(/,/g, '');
                    else
                        break_count++;
                    if(break_count == 10)
                        break;
                    if(price >= min_price && price <= max_price && !products_name_array[i].includes(black_word))
                    {
                        var asin_array = [];
                        var aname_array = [];
                        var aprice_array = [];
                        if(stop_count == 50)
                        {
                            sleep(30000);
                            stop_count = 0;
                        }
                        var amazon_url = "https://www.amazon.co.jp/s?k=" + products_name_array[i] + "&__mk_ja_JP=カタカナ&ref=nb_sb_noss";
                        $.ajax({
                            url: amazon_url,
                            type: 'GET',
                            async: false,
                            success: function(response) {
                                var ama_nodes = $($.parseHTML(response));
                                ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20').each(function () {
                                    asin_array.push($(this).attr('data-asin'));
                                });
                                ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20 .a-size-base-plus.a-color-base.a-text-normal').each(function () {
                                    aname_array.push($(this).text());
                                });
                                ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20 .a-offscreen').each(function () {
                                    aprice_array.push($(this).text());
                                });
                            },
                            error: function() {
            
                            }
                        });
                        stop_count++;
                        var asin_temp = asin_array[0] == undefined ? '' : asin_array[0];
                        var aname_temp = aname_array[0] == undefined ? '' : aname_array[0].replace(/,/g, ' ');
                        var aprice_temp = aprice_array[0] == undefined ? 0 : aprice_array[0].replace(/￥/g, '').replace(/,/g, '');
                        
                        var jan_temp = ''
                        $.ajax({
                            url: products_url_array[i],
                            type: 'GET',
                            async: false,
                            success: function (response) {
                                var jan_nodes = $($.parseHTML(response));
                                jan_temp = jan_nodes.find('.mdItemSubInformation .elRow .elRowTitle p').filter(function () {
                                    return $(this).text() === 'JANコード/ISBNコード';
                                }).parent().parent().find('.elRowData p').text();
                            },
                            error: function() {

                            }
                        });

                        var rows_data = {};
                        if(property_id.indexOf('all') != -1)
                        {
                            rows_data['ASIN'] = asin_temp;
                            rows_data['商品名(Amazon)'] = aname_temp;
                            rows_data['販売価格(Amazon)'] = aprice_temp;
                            rows_data['JANコード'] = jan_temp;
                            rows_data['商品名'] = products_name_array[i].replace(/,/g, ' ');
                            rows_data['販売価格'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '');
                            rows_data['セラーID'] = products_seller_array[i];
                            rows_data['価格差'] = rows_data['販売価格'] - rows_data['販売価格(Amazon)'];
                        }
                        else
                        {
                            if(property_id.indexOf('asin') != -1)
                                rows_data['ASIN'] = asin_temp;
                            if(property_id.indexOf('aname') != -1)
                                rows_data['商品名(Amazon)'] = aname_temp;
                            if(property_id.indexOf('aprice') != -1)
                                rows_data['販売価格(Amazon)'] = aprice_temp;
                            if(property_id.indexOf('jan') != -1)
                                rows_data['JANコード'] = jan_temp;
                            if(property_id.indexOf('name') != -1)
                                rows_data['商品名'] = products_name_array[i].replace(/,/g, ' ');
                            if(property_id.indexOf('price') != -1)
                                rows_data['販売価格'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '');
                            if(property_id.indexOf('seller_id') != -1)
                                rows_data['セラーID'] = products_seller_array[i];
                            if(property_id.indexOf('price_diff') != -1)
                                rows_data['価格差'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '') - aprice_temp;
                        }
                        result_data.push(rows_data);
                        index++;
                    }
                    i++;
                }
            }

            var csv = JSON2CSV(result_data);
            var codeArr = Encoding.convert(csv, {
                from: 'UNICODE',
                to: 'SJIS',
                type: 'array'
            });
            var unit8Array = new Uint8Array(codeArr);
            var blob = new Blob([unit8Array], {type: 'text/csv'});
            var url = URL.createObjectURL(blob);
            
            var dateObj = new Date();
            var day = dateObj.getDate();
            var month = dateObj.getMonth() + 1;
            var year = dateObj.getFullYear();
            var today = year + '-' + month + '-' + day;

            chrome.downloads.download({
                url: url,
                filename: "Yahoo!検索結果(" + seller_id + "_" + today +  ").csv"
            });
            return;
        }
        else
        {
            var url = "https://store.shopping.yahoo.co.jp/" + seller_id + "/search.html?p=" + keyword + "&X=" + order_id + "&n=100#CentSrchFilter1";
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                success: function (response) {
                    var dom_nodes = $($.parseHTML(response));

                    total_count = dom_nodes.find('.mdSearchHeader .elHeader .elHeaderTitle').text();
                    total_count = total_count.split('（')[1];
                    if(!total_count)
                    {
                        notify_func("検索結果がありません。");
                        return;
                    }                    
                    else
                    {
                        total_count = total_count.split('件')[0].replace(',', '');
                        total_count = total_count == '' ? 0 : total_count;
                        dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elImage a').each(function () {
                            var jan_code = $(this).attr('href');
                            products_url_array.push(jan_code);
                        });
                        
                        dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elName a span').each(function () {
                            products_name_array.push($(this).text());
                        });
                        
                        dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elPrice .elPriceItem .elPriceValue').each(function () {
                            products_price_array.push($(this).text());
                        });
                    }
                },
                error: function () {
                    
                }
            });

            if(total_count > count_id * 2)
            {
                for(var i = 1; i <= count_id * 2 / 100; i++)
                    ajax_yahoo(sell_arr[j], keyword, order_id, i);
            }
            else
            {
                for(var i = 1; i <= total_count / 100; i++)
                    ajax_yahoo(sell_arr[j], keyword, order_id, i);
            }

            var index = 0;
            for(let i in products_name_array)
            {
                var price = 0;
                if(products_price_array[i])
                    price = products_price_array[i].replace(/円/g, '').replace(/,/g, '');
                if(price >= min_price && price <= max_price && !products_name_array[i].includes(black_word))
                {
                    var asin_array = [];
                    var aname_array = [];
                    var aprice_array = [];
                    if(stop_count == 50)
                    {
                        sleep(30000);
                        stop_count = 0;
                    }
                    var amazon_url = "https://www.amazon.co.jp/s?k=" + products_name_array[i] + "&__mk_ja_JP=カタカナ&ref=nb_sb_noss";
                    $.ajax({
                        url: amazon_url,
                        type: 'GET',
                        async: false,
                        success: function(response) {
                            var ama_nodes = $($.parseHTML(response));
                            ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20').each(function () {
                                asin_array.push($(this).attr('data-asin'));
                            });
                            ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20 .a-size-base-plus.a-color-base.a-text-normal').each(function () {
                                aname_array.push($(this).text());
                            });
                            ama_nodes.find('.s-main-slot.s-result-list.s-search-results.sg-row .sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20 .a-offscreen').each(function () {
                                aprice_array.push($(this).text());
                            });
                        },
                        error: function() {
        
                        }
                    });
                    stop_count++;
                    var asin_temp = asin_array[0] == undefined ? '' : asin_array[0];
                    var aname_temp = aname_array[0] == undefined ? '' : aname_array[0].replace(/,/g, ' ');
                    var aprice_temp = aprice_array[0] == undefined ? 0 : aprice_array[0].replace(/￥/g, '').replace(/,/g, '');
                    
                    var jan_temp = ''
                    $.ajax({
                        url: products_url_array[i],
                        type: 'GET',
                        async: false,
                        success: function (response) {
                            var jan_nodes = $($.parseHTML(response));
                            jan_temp = jan_nodes.find('.mdItemSubInformation .elRow .elRowTitle p').filter(function () {
                                return $(this).text() === 'JANコード/ISBNコード';
                            }).parent().parent().find('.elRowData p').text();
                        },
                        error: function() {
    
                        }
                    });
                    
                    var rows_data = {};
                    
                    if(property_id.indexOf('all') != -1)
                    {
                        rows_data['ASIN'] = asin_temp;
                        rows_data['商品名(Amazon)'] = aname_temp;
                        rows_data['販売価格(Amazon)'] = aprice_temp;
                        rows_data['JANコード'] = jan_temp;
                        rows_data['商品名'] = products_name_array[i].replace(/,/g, ' ');
                        rows_data['販売価格'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '');
                        rows_data['セラーID'] = seller_id;
                        rows_data['価格差'] = rows_data['販売価格'] - rows_data['販売価格(Amazon)'];
                    }
                    else
                    {
                        if(property_id.indexOf('asin') != -1)
                            rows_data['ASIN'] = asin_temp;
                        if(property_id.indexOf('aname') != -1)
                            rows_data['商品名(Amazon)'] = aname_temp;
                        if(property_id.indexOf('aprice') != -1)
                            rows_data['販売価格(Amazon)'] = aprice_temp;
                        if(property_id.indexOf('jan') != -1)
                            rows_data['JANコード'] = jan_temp;
                        if(property_id.indexOf('name') != -1)
                            rows_data['商品名'] = products_name_array[i].replace(/,/g, ' ');
                        if(property_id.indexOf('price') != -1)
                            rows_data['販売価格'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '');
                        if(property_id.indexOf('seller_id') != -1)
                            rows_data['セラーID'] = seller_id;
                        if(property_id.indexOf('price_diff') != -1)
                            rows_data['価格差'] = products_price_array[i].replace(/,/g, '').replace(/円/g, '') - aprice_temp;
                    }
                    result_data.push(rows_data);
                    index++;

                    if(index == count_id || i == products_name_array.length - 1)
                    {                    
                        var csv = JSON2CSV(result_data);
                        var codeArr = Encoding.convert(csv, {
                            from: 'UNICODE',
                            to: 'SJIS',
                            type: 'array'
                        });
                        var unit8Array = new Uint8Array(codeArr);
                        var blob = new Blob([unit8Array], {type: 'text/csv'});
                        var url = URL.createObjectURL(blob);
                        
                        var dateObj = new Date();
                        var day = dateObj.getDate();
                        var month = dateObj.getMonth() + 1;
                        var year = dateObj.getFullYear();
                        var today = year + '-' + month + '-' + day;
    
                        chrome.downloads.download({
                            url: url,
                            filename: "Yahoo!検索結果(" + seller_id + "_" + today +  ").csv"
                        });
                        return;
                    }
                }
            }
        }

    });

    function JSON2CSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';

            for (var index in array[i]) {
                line += array[i][index] + ',';
            }

            line = line.slice(0, -1);
            str += line + '\r\n';
        }
        return str;
    }

    function notify_func(message)
    {
        $.notify({
            title: '警告',
            message: message
        },
        {
            type:'danger',
            allow_dismiss:false,
            newest_on_top:false ,
            mouse_over:false,
            showProgressbar:false,
            spacing:10,
            timer:2000,
            placement:{
              from:'top',
              align:'left'
            },
            offset:{
              x:30,
              y:30
            },
            delay:1000 ,
            z_index:10000,
            animate:{
              enter:'animated bounce',
              exit:'animated bounce'
          }
        });
    }

    function notify_sucess(message)
    {
        $.notify({
            title: '警告',
            message: message
        },
        {
            type:'success',
            allow_dismiss:false,
            newest_on_top:false ,
            mouse_over:false,
            showProgressbar:false,
            spacing:10,
            timer:3000,
            placement:{
              from:'top',
              align:'left'
            },
            offset:{
              x:30,
              y:30
            },
            delay:1000 ,
            z_index:10000,
            animate:{
              enter:'animated bounce',
              exit:'animated bounce'
          }
        });
    }

    function ajax_yahoo(seller_id, keyword, order_id, page_number)
    {
        var url = "https://store.shopping.yahoo.co.jp/" + seller_id + "/search.html?p=" + keyword + "&X=" + order_id + "&n=100&page=" + page_number + "#CentSrchFilter1";
        $.ajax({
            url: url,
            type: 'GET',
            async: false,
            success: function (response) {
                var dom_nodes = $($.parseHTML(response));
                dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elImage a').each(function () {
                    var jan_code = $(this).attr('href');
                    products_url_array.push(jan_code);
                });
                dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elName a span').each(function () {
                    products_name_array.push($(this).text());
                    products_seller_array.push(seller_id);
                });
                dom_nodes.find('.mdSearchResult.isGrid .elItems .elItem .elItemContents .elItemContent .elPrice .elPriceItem .elPriceValue').each(function () {
                    products_price_array.push($(this).text());
                });
            },
            error: function () {
                
            }
        });
    }

    $('#count_id, #min_price, #max_price, #black_word').change(function () {
        $(this).addClass('changed-event');
    });

    $('#property_id').change(function () {
        $('#property_id_chosen').addClass('changed-event');
    });

    $('#order_id').change(function () {
        $('#order_id_chosen').addClass('changed-event');
    });

    $('.log-btn').click(function () {
        chrome.storage.local.remove(["user_name"], function () {
            location.href = "login.html";
        });
    });

    $('#reset-btn').click(function (e) {
        e.preventDefault();
        $('#count_id').val(50);
        $('#search').val('');
        $("#order_id").val("4").change();
        $('#order_id_chosen .chosen-single span').text('売れている順');
        $("#property_id").val("all").change();
        $('#property_id').trigger("chosen:updated");
        $('#min_price').val(1);
        $('#max_price').val(99999);
        $('#black_word').val('');
        $(".progress-bar").animate({
            width: '0%'
        }, 0);
        $(".progress-bar").prop('Counter', 0).animate(
            {
                Counter: 0
            },
            {
                // duration: delay,
                // easing: 'swing',
                step: function(now) {
                    $(".progress-bar").text(Math.ceil(now) + '%');
                }
            }
        );
    });
});