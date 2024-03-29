(function($){
    $.fn.facv = function( orguments ){
        var o = $.extend({
                datepicker: '.endDatePicker',
                modal: '#newAdvert',
                login: '#loginModal',
                alert: '.alert-div',
                locale: {
                    selected: localStorage.getItem('lang') || 'ua',
                    class: '.translateMe',
                    available: {
                        'ru': 'Русский',
                        'ua': 'Українська',
                        'en': 'English'
                    }
                },
                debug: false,
                loginAddress: 'server/login.php',
                source: 'server/adverts.php'
            }, orguments),

            _uploadImage = '',

            todo = this,

            /*
             * items cache
             */
            cache = {
                adverts: {},
                categories: {},
                search: {}
            },
            locale = {},

            /*
             * AJAX errors handlers
             */
            handlers = {
                postError: function( error ){
                    var err = '';
                    if(o.debug)
                        err = '<br>' + error.responseText;

                    console.log( 'POST ERROR: ', error.responseText );
                    m.alert( locale.errors.client['failedSend'] + err );
                },

                getError: function( error ){
                    console.log('ERROR: ', error.responseText);
                }
            },

            /*
             * UI messages
             */
            m = {
                alert: function(msg){
                    $( o.alert ).append('<div data-alert class="alert-box alert">' + msg + '<a href="#" class="close">&times;</a></div>');
                    $(document).foundation('alert', 'reflow');
                },
                success: function(msg){
                    $( o.alert ).append('<div data-alert class="alert-box success">' + msg + '<a href="#" class="close">&times;</a></div>');
                    $(document).foundation('alert', 'reflow');
                }
            }

            /*
             * Button animation
             */
            animate = {
                loading: function( target, text ){
                    var original = $(target).html();
                    var i = 0;
                    var A;

                    function startFun(){
                        A = setInterval(function(){
                            var display = text;

                            for(n=0; n < i; n++)
                                display += '.';
        
                            i = i < 3 ? i + 1 : 0;
                            $(target).html(display);
                        }, 300);
                    }
                        
                    return {
                        start: function(){
                            startFun();
                        },
                        stop: function(){
                            window.clearInterval(A);
                        },
                        update: function(text){
                            window.clearInterval(A);
                            $(target).html(text);
                        },
                        reset: function(){
                            window.clearInterval(A);
                            $(target).html(original);
                        }
                    }
                }
            },

            /*
             * Regexp validating functions
             */
            validate = {
                email: function( value ) {
                    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
                },

                url: function( value ) {
                    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test( value );
                },

                date: function( value ) {
                    return !/Invalid|NaN/.test( new Date( value ).toString() );
                },

                dateISO: function( value ) {
                    return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
                },

                number: function( value ) {
                    return /^[\d\+\s]+$/.test( value );
                },

                title: function( value ) {
                    return value.split('').length <= 57;
                },

                text: function( value ) {
                    return value.split('').length <= 10000;
                },

                category:  function( value ) {
                    return cache.categories[ value ] !== undefined;
                }
            },

            /*
             * Templates
             * * advert
             * * modal window
             * * category
             */
            models = {
                advert: function( data ){
                    var img = data.image ? 'uploads/' + data.image : 'img/placeholder.png';
                    return '<a href="#" class="modal-reveal" data-id="' + data.id + '">' + 
                                '<div class="large-3 columns item" data-id="' + data.id + '">' +
                                    '<div class="thumb" style="background-image: url(\'' + img + '\')"></div>' +
                                    '<div class="panel">' +
                                        '<h5>' + data.title  + '</h5>' +
                                        '<p>' + data.text + '</p>' +
                                    '</div>' +
                                '</div></a>';
                }, 
                category: function( id, name ){
                    return {
                        link: '<li class="tab-title" role="presentational" ><a href="#cat-' + id + '" role="tab" tabindex="0"aria-selected="false" controls="cat-' + id + '">' + name + '</a></li>',
                        tab: '  <section role="tabpanel" aria-hidden="false" class="content" id="cat-' + id + '"><div class="large-12 columns items"></div></section>'
                    }
                },
                modal: function( data ){
                    var img = data.image ? 'uploads/' + data.image : 'img/placeholder.png';
                    return  '<div id="myModal" class="reveal-modal large" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">' +
                                '<div class="large-4 columns">' +
                                    '<div class="thumb" style="background-image: url(\'' + img + '\')"></div>' +
                                '</div>' +
                                '<div class="large-8 columns">' +
                                    '<small>' + locale.frontend['publishedOn'] + ': ' + data.startDate + ' | ' + locale.frontend['endingDate'] + ': ' + data.endDate + '</small><br/>' +
                                    '<h1>' + data.title + '</h1><br/>' +
                                    '<p>' + data.text + '<br/>'+
                                    locale.frontend['email'] + ' : ' + data.email + '<br/>'+
                                    locale.frontend['phone'] + ': ' + data.phone + '</p>' +
                                '</div>' +
                                '<a class="close-reveal-modal" aria-label="Close">&#215;</a>' +
                            '</div>';
                }
            };

            /*
             * Rendering function
             * * advert
             * * modal window
             * * category
             * * locales
             * * languages
             */
            render = {
                categories: function( parent, data ){
                        //Iteration through the categories
                    for (var i = 0, f; category = data[i]; i++) {

                        //Save category to cache
                        cache.categories[category.id] = category;

                        var catappend = models.category( category.id, category.name );

                        //Create tab
                        $(parent).append( catappend.tab );

                        //Create tab-link
                        $( o.links ).append( catappend.link );

                        //Add categories to options in modal form
                        $( 'select', o.modal).append('<option value="' + category.id + '">' + category.name + '</option>');
                    };
                },
                adverts: function( parent, data ){
                    //Iteration through the categories
                    for (var i = 0, f; advert = data[i]; i++) {

                        // //Checks if advert is not outdated. 
                        if( Date.parse(advert.endDate) > Date.now() ){

                            //Save advert to cache
                            cache.adverts[advert.id] = advert;

                            cache.search[advert.id] = (function(advert){
                                var string = '';
                                var keys = Object.keys(advert);
                                for(var i = 0; i < keys.length; i++)
                                    string = string + ' ' + advert[keys[i]];

                                return string;
                            })(advert)

                            //Add item
                            this.addAdvert(parent, advert);
                        }
                        
                    };

                    var advertsIDs = Object.keys( cache.adverts );
                    if( advertsIDs.length < 8 ){f
                        for(var i = 0; i < advertsIDs.length; i++)
                            $('#main').append(models.advert(cache.adverts[advertsIDs[i]]));

                    }else{
                        var rendAdverts = (function(adv){
                            var temp = [];
                            var getRand = function(){
                                return Math.floor(Math.random() * ( adv.length - 1 ));
                            }

                            while( temp.length < 8 ){
                                var id = getRand();
                                if( temp.indexOf( id ) === -1 )
                                    temp.push( id );
                            }

                            return temp;

                        })(advertsIDs);
                        for(var i = 0; i < rendAdverts.length; i++){
                            var advID = advertsIDs[rendAdverts[i]];
                            $('#main').append( models.advert( cache.adverts[advID] ) );
                        }
                    }

                },
                addAdvert: function( parent, data ){
                    $( 'section#cat-' + data.categoryId + ' > .items', parent ).append( models.advert(data) );
                    $(document).foundation('reveal', 'reflow');
                },
                locale: function(){
                    $(o.locale.class).each(function(){
                        var tid = $(this).data('tid');
                        if($(this).is("input")){
                            $(this).attr('placeholder', locale.frontend[tid]);
                        }else{
                            $(this).text(locale.frontend[tid]);
                        }
                    })
                    $('.loading').remove();
                },
                languages: function(){
                    for (var i = 0, f; key = Object.keys(o.locale.available)[i]; i++)
                        $('.languages').append('<li><a href="#" class="lang" data-lang="' + key + '">' + o.locale.available[key] + '</a></li>');
                }
            };

        /*
         * locale DATA loader
         */
        $.getJSON( 'locale/' + o.locale.selected + '.locale.json' ).done(function( l ){
            locale = l;
            cache.categories = locale.categories;

            todo.each(function(){
                render.categories(this, locale.categories);
                render.locale();
                render.languages();
            })

            /*
             * adverts DATA loader
             * @param  {[type]} data ){                          if(data.status [description]
             * @return {[type]}      [description]
             */
            $.getJSON( o.source ).done(function( data ){

                if(data.status === 200){
                    todo.each(function(){
                        render.adverts(this, data.adverts);  
                    })
                }else m.alert(locale.errors.server[data.status]);

            }).fail(handlers.getError);

        }).fail(handlers.getError);

        /*----------HANDLERS----------*/

        //Event handler for modal windows
        $(document).on( 'click', '.modal-reveal', function(){

            //Get items id
            var id = $(this).data('id');

            //Retrieves advert from cache
            var info = cache.adverts[id];

            //Generates new modal
            var modal = models.modal( info )

            //Reveals modal
            $(modal).foundation( 'reveal', 'open' );
        });

        //Event handler for searching
        $('input[name=search]').on('input', function(){
            //Get input value
            var stuff = $(this).val();

            //Open search results tab
            $('.content').removeClass('active');
            $('#search').toggleClass('active');

            //Perform search
            var keys = Object.keys( cache.adverts );

            //Clean search space
            $('#search').html('')
            var patt = new RegExp( stuff, 'ig' );

            keys.forEach(function( item, i ){
                if (patt.test( cache.search[item] )){
                    var outAdvert = models.advert( cache.adverts[item] );
                    $('#search').append( outAdvert );
                }

            });
        });

        /*
         * search input cleaner
         */
        $(document).on('click', '*[role=tab]', function(){
            $('input[name=search]').val('');
        })

        /*
         * Form validation for advert adding
         */
        $(document).on( 'click', '.sbmt', function(){

            var ok = true;
            var post = {};
            var st = $(this).parents().eq(2);

            //Resets errors
            $( 'small.error', st ).remove();
            $( '.error', st ).removeClass('error');

            $( 'input, select, textarea', st ).each(function(){
                var field = {
                    value: $(this).val(),
                    type: $(this).data('type'),
                    name: $(this).attr('name'),
                    validate: $(this).data('eval'),
                    sid: $(this).data('sid')
                }
                /*
                 * If field is to be validated
                 */
                if( field.validate ){
                    /*
                     * if field is not empty
                     */
                    if( field.value ){
                        /*
                         * if valid
                         */
                        if( ! validate[field.type](field.value)){
                            ok = false;
                            $(this).addClass( 'error' );
                            $(this).after( '<small class="error">' + locale.errors.client.failedValidate.replace('%field%', field.name) + '</small>' );
                        }else{
                            post[field.sid] = field.value;
                        }

                    }else{
                        ok = false;
                        $(this).addClass( 'error' );
                        $(this).after( '<small class="error">' + locale.errors.client.emptyField + '</small>' );
                    }
                }
                
                
            }).promise().done(function(){
                /*
                 * if valid
                 */
                if(ok){

                    /*
                     * saving image
                     */
                    post['image'] = _uploadImage;
                     _uploadImage = '';

                    /*
                     * closing modal
                     */
                    $( o.modal ).foundation('reveal', 'close');

                    /*
                     * performing post request to add out advert
                     */
                    $.post( o.source, post, function( data ){
                        var msg = '';
                        /*
                         * if debug
                         */
                        if(o.debug){
                            msg = '<br>' + data;
                            console.log('POST SUCCESS: ', data);
                        }

                        /*
                         * if response OK
                         */
                        if(data.status === 200){
                            /*
                             * add to cache
                             */
                            cache.adverts[data.advert.id] = data.advert;
                            /*
                             * render
                             */
                            render.addAdvert($(todo)[0], data.advert);
                            /*
                             * success message
                             */
                            m.success( locale.errors.client.successAdded + msg );
                        }else{
                            m.alert( locale.errors.server[data.status] + msg );
                        }

                    }).fail(handlers.postError)
                }
            });
        });

        /*----- LOGIN Challenge-Response -----*/
        $(document).on( 'click', '.login', function(){

            var ok = true;
            var post = {};
            var st = $(this).parents().eq(1);
            var Super = this;
            

            //Resets errors
            $( 'small.error', st ).remove();
            $( '.error', st ).removeClass('error');

            /*
             * Validating login form
             */
            $( 'input', st ).each(function(){
                var field = {
                    value: $(this).val(),
                    name: $(this).attr('name')
                }

                if(!field.value){
                    ok = false;
                    $(this).addClass( 'error' );
                    $(this).after( '<small class="error">' + locale.errors.client.emptyField + '</small>' );
                }

                post[field.name] = field.value;

            }).promise().done(function(){
                /*
                 * if valid
                 */
                if(ok){
                    /*
                     * start loading animation
                     */
                    var animation = animate.loading(Super, locale.frontend['loading']);
                    animation.start();

                    /*
                     * getting challenge
                     */
                    $.post(o.loginAddress, {'username': post.username}, function( challenge ){

                        /*
                         * generating response ( sha512(password + challenge) )
                         */
                        var response = CryptoJS.SHA512(post.password + challenge.challenge).toString();

                        /*
                         * sending response
                         */
                        $.post( o.loginAddress, {'response': response}, function( status ){
                            /*
                             * stopping loading animation
                             */
                            animation.stop();

                            /*
                             * if logged in
                             */
                            if( status.authorized )
                                animation.update(locale.frontend['success']);
                            else
                                animation.update(locale.frontend['failed']);

                            /*
                             * showing success and redirecting to admin.
                             */
                            setTimeout(function(){
                                animation.reset();
                                if(status.authorized){
                                    
                                    $( o.login ).foundation('reveal', 'close');
                                    window.location.replace('server/admin');

                                }
                            }, 1500);

                        }).fail(handlers.postError)
                    }).fail(handlers.postError)
                }
            });
        });

        /*
         * clearing inputs when modals are closing
         */
        $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
            var modal = $(this);
            $('.dropzone.parent', modal).css('background-image', '');
            $( 'small.error', modal ).remove();
            $( 'input, select, textarea', modal ).each(function(){
                $(this).val('');
                $(this).removeClass('error');
            });
        });

        /*
         * checking if user is logged in, if yes redirecting to admin
         * otherwise login modal
         */
        $('.loginBtn').on('click', function(){
             // data-reveal-id="loginModal"
            $.getJSON( '/server/login', function( data ) {
                if( data.authorized === true )
                    window.location.replace('server/admin');
                else
                    $('#loginModal').foundation('reveal', 'open');

            })
        })
        
        /*
         * change language
         */
        $(document).on('click', '.lang', function () {

            var newLang = $(this).data('lang');

            if(o.locale.available[newLang]){
                
                o.locale.selected = newLang;
                localStorage.setItem('lang', newLang);

            }

            location.reload();
        });

        /*----------Drag'n'Drop/File select----------*/
        var handleFileSelect = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; //Tweak for filedrop and click;
            // files is a FileList of File objects. List some properties.

            var output = [];
            var reader = new FileReader();
            for (var i = 0, f; f = files[i]; i++) {
                if (!f.type.match('image.*')) {
                    m.alert(locale.errors.client.imageOnly);
                    continue;
                }
                reader.onload = (function(theFile) {
                    return function(e) {
                        _uploadImage = e.target.result;
                        $('.dropzone.parent').css('background-image', 'url(' + e.target.result + ')');
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            }

           
        }
       
        /*
         * Drag and drop
         */
        var handleDragOver = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }

        // Setup the dnd listeners.
        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
        document.getElementById('files').addEventListener('change', handleFileSelect, false);
        
        /*
         * area event handler for file promt
         */
        $("#drop_zone").click(function(e){
            e.preventDefault();
            $("#files").trigger('click');
        });
        /*----------HANDLERS ENDS----------*/

        $( o.datepicker ).fdatepicker({
            onRender: function (date) {
                // console.log(date);
                if( Date.parse(date) <= Date.now()
                ||  Date.parse(date) >= Date.now() + 30*24*60*60*1000 ){
                     return 'disabled';
                }
            },
            format: 'yyyy-mm-dd'
        });        
    }
})(jQuery)