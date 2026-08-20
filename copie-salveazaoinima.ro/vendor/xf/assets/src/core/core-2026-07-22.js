window.onerror = function (msg) {
    $("body").attr("js-error", msg);
}

document.addEventListener('DOMContentLoaded', function () {
    $("body").attr("js-loaded", 'ok');
}, false);

var api = {
    post: function (url, params, callback) {
        if (window.XMLHttpRequest) {
            var xmlhttp = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            alert("Browser does not support XMLHTTP.");
            return false;
        }

        xmlhttp.open("POST", url, true);

        //xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
        //xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        if (typeof params === 'string') {

            params = formDataToKeyValue(Form_Data(params));
            //params=Form_Data(params);
            //console.warn(params);
        } else {

            //params = JSON.stringify(params);
        }

        const urlEncodedDataPairs = [];
        // Turn the data object into an array of URL-encoded key/value pairs.
        for (const [key, value] of Object.entries(params)) {
            urlEncodedDataPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        ;

        // Combine the pairs into a single string and replace all %-encoded spaces to
        // the '+' character; matches the behavior of browser form submissions.
        const urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        xmlhttp.send(urlEncodedData);

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                try {
                    if (callback) {
                        return callback(JSON.parse(xmlhttp.responseText));
                    } else {
                        return JSON.parse(xmlhttp.responseText);
                    }
                } catch (error) {
                    console.warn(error);
                    // throw Error;
                }
            }
        }
    }
}

var xf = {


    api: api,

    event: {
        trigger: function (eventName, detail) {
            if (typeof CustomEvent != "undefined" && CustomEvent) {
                var event = new CustomEvent(eventName, {
                    detail: detail || {},
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            } else {
                $(document).trigger(eventName, detail);
            }
        }
    },

    translate: function (translations) {
        if (translations[LANG]) {
            return translations[LANG];
        }
        return translations.pop();
    },

    btnLoading: function (elem, timeout=0, text='Loading...') {
        var e = jQuery(elem);

        if(e.data('loading-text')){
            text=e.data('loading-text');
        }
        e.data('original-text',e.html()).html(text).prop('disabled', true).addClass('disabled').css("pointer-events", "none");

        if (timeout > 0) {
            setTimeout(function() {
                xf.btnReset(e);
            }, timeout);
        }
    },
    btnReset: function (elem){
        var e = jQuery(elem);
        if (e.data('original-text')) {
            e.html(e.data('original-text')).prop('disabled', false).removeClass('disabled').css("pointer-events", '');
        }
    },

    parsleyError: function (fieldIdentifier, message) {
        this.parsleyReset(fieldIdentifier);
        $(fieldIdentifier).parsley().addError('error', {message: message, updateClass: true});
    },
    parsleyReset: function (fieldIdentifier) {
        $(fieldIdentifier).parsley().removeError('error', {updateClass: true});
    },
    window: function (url, data, id) {
        return modal(url, data);
    },
    console: function (msg, mode) {
        if (mode == undefined) {
            mode = 'log';
        }

        if (typeof console != "undefined") {
            if (mode == 'log') {
                console.log(msg);
            } else if (mode == 'info' && typeof console.info === 'function') {
                console.info(msg);
            } else if (mode == 'error' && typeof console.error === 'function') {
                console.error(msg);
            } else {
                console.log(msg);
            }
        }
    },
    window_close: function (id) {
        console.error('Window Close is deprecated');
        $('#' + id).remove();
    },
    windowClose: function (id) {
        return this.window_close(id);
    },
    permalink: function (string) {
        var re = /[^a-z0-9]+/gi;
        var re2 = /^-*|-*$/g;
        string = string.replace(re, '-');
        return string.replace(re2, '').toLowerCase();
    },
    btn_toggle: function (id) {
        var defaultClass = 'btn-default';
        if(BS_VERSION >= 4) {
            defaultClass = 'btn-light';
            if($('body').hasClass('dark-version')) {
                defaultClass = 'btn-dark';
            }
        }

        if ($('#' + id).val() == 0) {
            $('#' + id).val(1).trigger('change');
            $('#icon' + id).removeClass('fa-toggle-off');
            $('#icon' + id).addClass('fa-toggle-on');
            $('#btn' + id).removeClass('btn-warning');
            $('#btn' + id).removeClass(defaultClass);
            $('#btn' + id).addClass('btn-success');
        } else {
            $('#' + id).val(0).trigger('change');
            $('#icon' + id).removeClass('fa-toggle-on');
            $('#icon' + id).addClass('fa-toggle-off');
            $('#btn' + id).removeClass('btn-success');
            $('#btn' + id).addClass(defaultClass);
        }
    },
    live: function (url, container, data) {
        if (typeof (EventSource) !== "undefined") {
            var source = new EventSource(url + '?_output=ajax');
            source.onmessage = function (event) {
                document.getElementById(container).innerHTML = event.data;
                xf.console(event);
            };
        } else {
            ajax(url, container, data);
        }
    },
    find: function (e, container, reper, type) {
        var value = $(e).val().toLowerCase();
        xf.console('[XF.find][value]: ' + value);
        if (value.length >= 1) {
            xf.console('[XF.find][hide]: ' + container + ' ' + reper);
            $(container + ' ' + reper).hide();
            var spans = $(container).find(reper);
            xf.console('[XF.find][spans]: ' + spans.length);
            if (spans.length > 0) {
                spans.each(function (k, v) {
                    if (type == 'val') {
                        var string = $(v).val().toLowerCase();
                    } else if (type == 'text') {
                        var string = $(v).text().toLowerCase();
                    } else {
                        var string = $(v).html().toLowerCase();
                    }
                    if (string.indexOf(value) >= 0) {
                        $(v).show();
                    }

                })
            }
        } else {
            $(container + ' ' + reper).show();
        }
    },
    alert: function (options, callback) {
        if (typeof options == 'undefined') {
            options = {};
        }

        let params = {
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: true
        };

        if (options.hasOwnProperty('title')) {
            params.title = options.title;
        }

        if (options.hasOwnProperty('timeout')) {
            params.timer = options.timeout;
        }

        if (options.hasOwnProperty('timer')) {
            params.timer = options.timer;
        }


        if (options.hasOwnProperty('message')) {
            params.html = options.message;
        }

        if (options.hasOwnProperty('type') && options.type !== 'default') {
            if (options.type === 'danger') {
                options.type = 'error';
            }

            // SweetAlert2 v11+ only supports 'icon', not 'type'
            params.icon = options.type;
        }

        if (options.hasOwnProperty('confirmButtonText')) {
            params.confirmButtonText = options.confirmButtonText;
        }

        if (options.hasOwnProperty('confirmButtonClass')) {
            if (!params.customClass) {
                params.customClass = {};
            }
            params.customClass.confirmButton = options.confirmButtonClass;
        }

        if (options.hasOwnProperty('class')) {
            if (!params.customClass) {
                params.customClass = {};
            }
            params.customClass.popup = options.class;
        }

        if (options.hasOwnProperty('width')) {
            params.width = options.width;
        }

        if (typeof callback == 'function') {
            Swal.fire(params).then((confirmed) => {
                if (confirmed && confirmed.value === true) {
                    callback();
                }
            });
        } else {
            Swal.fire(params);
        }
    },
    confirm: function (options, callbackYes, callbackNo) {
        if (typeof options == 'undefined') {
            options = {};
        }

        let params = {
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: true,
            showCancelButton: true,
            reverseButtons: true
        };

        if (options.hasOwnProperty('title')) {
            params.title = options.title;
        }

        if (options.hasOwnProperty('message')) {
            params.html = options.message;
        }

        if (options.hasOwnProperty('type') && options.type !== 'default') {
            if (options.type === 'danger') {
                options.type = 'error';
            }

            params.type = options.type;
            params.icon = options.type;
        }

        if (options.hasOwnProperty('buttons')) {
            if (options.buttons.hasOwnProperty('confirm')) {
                if (options.buttons.confirm.hasOwnProperty('label')) {
                    options.confirmButtonText = options.buttons.confirm.label;
                }
                if (options.buttons.confirm.hasOwnProperty('className')) {
                    options.confirmButtonClass = options.buttons.confirm.className;
                }
            }

            if (options.buttons.hasOwnProperty('cancel')) {
                if (options.buttons.cancel.hasOwnProperty('label')) {
                    options.cancelButtonText = options.buttons.cancel.label;
                }
                if (options.buttons.cancel.hasOwnProperty('className')) {
                    options.cancelButtonClass = options.buttons.cancel.className;
                }
            }
        }

        if (options.hasOwnProperty('confirmButtonText')) {
            params.confirmButtonText = options.confirmButtonText;
        }

        if (options.hasOwnProperty('cancelButtonText')) {
            params.cancelButtonText = options.cancelButtonText;
        }

        if (options.hasOwnProperty('confirmButtonClass')) {
            if (!params.customClass) {
                params.customClass = {};
            }
            params.customClass.confirmButton = options.confirmButtonClass;
        }

        if (options.hasOwnProperty('cancelButtonClass')) {
            if (!params.customClass) {
                params.customClass = {};
            }
            params.customClass.cancelButton = options.cancelButtonClass;
        }

        if (options.hasOwnProperty('class')) {
            if (!params.customClass) {
                params.customClass = {};
            }
            params.customClass.popup = options.class;
        }

        if (options.hasOwnProperty('width')) {
            params.width = options.width;
        }

        Swal.fire(params).then((confirmed) => {
            if (confirmed && confirmed.value === true) {
                if (typeof callbackYes == 'function') {
                    callbackYes();
                }
            } else {
                if (typeof callbackNo == 'function') {
                    callbackNo();
                }
            }
        });
    },
    customEvents: true,
    
    // Event handling system
    event: {
        _events: {},
        
        /**
         * Subscribe to an event or array of events
         * @param {string|array} eventName - The name of the event to subscribe to or an array of event names
         * @param {Function} callback - The function to call when the event is triggered
         */
        on: function(eventName, callback) {
            // If eventName is a string, convert it to an array for consistent processing
            if (typeof eventName === 'string') {
                eventName = [eventName];
            }
            
            // Process each event name in the array
            for (var i = 0; i < eventName.length; i++) {
                var event = eventName[i];
                
                if (!this._events[event]) {
                    this._events[event] = [];
                }
                if (!this._events[event].includes(callback)) {
                  this._events[event].push(callback);
                }
            }
        },
        
        /**
         * Trigger an event with optional data
         * @param {string} eventName - The name of the event to trigger
         * @param {*} data - Optional data to pass to the event handlers
         * @param {Function} defaultAction - Optional default action to execute if no listeners are attached
         */
        trigger: function(eventName, data, defaultAction) {
            console.log('Event triggered:', eventName, data);
            if (this._events[eventName] && this._events[eventName].length > 0) {
                this._events[eventName].forEach(function(callback) {
                    console.log('Event callback:', callback);
                    callback(data);
                });
            } else if (typeof defaultAction === 'function') {
                // Execute default action if no listeners are attached and defaultAction is provided
                console.log('Default callback:', defaultAction);
                defaultAction(data);
            }
        }
    }
};
var modal_id = 'modal';
var mod_crud_changes = [];

function check_form_changes(form_id) {
    if (typeof mod_crud_changes[form_id] == "undefined") {
        return true;
    }
    if (mod_crud_changes[form_id] === true) {
        var status = confirm('You have unsaved changes. Do you really want to exit?');
        if (status === true) {
            mod_crud_changes[form_id] = false;
        }
        return status;
    }
    return true;
}

function uconfig(key, value, timeout) {
    if (typeof timeout == "undefined") {
        var timeout = 0;
    }

    return ajax(BASE_URL + '/sys/user_config/?key=' + key + '&value=' + value + '&timeout=' + timeout);
}

function user_config(key, value, timeout) {
    deprecated('user_config', 'user_config');
    if (typeof timeout == "undefined") {
        var timeout = 0;
    }
    Ajax(BASE_URL + '/sys/user_config/?key=' + key + '&value=' + value + '&timeout=' + timeout);
}

function validate(form_id, options) {
    if (typeof $(document).parsley == 'undefined') {
        console.warn('Parsley not initialized correctly.');
        return false;
    }

    // Initialize custom Parsley validators if not already registered
    if (typeof window.Parsley !== 'undefined' && !window.Parsley._xfNotvalueRegistered) {
        window.Parsley.addValidator('notvalue', {
            validateString: function(value, requirement) {
                return value !== requirement;
            },
            messages: {
                en: 'This value is required.',
                ro: 'Această valoare este obligatorie!'
            }
        });
        window.Parsley._xfNotvalueRegistered = true;
    }

    form_id = form_id.replace('#', '');

    // Auto-exclude fields with hidden parents (display:none) or skip-validation class
    // This runs BEFORE Parsley checks data-parsley-excluded attribute
    $('#' + form_id).find('input, select, textarea').each(function() {
        var $field = $(this);
        
        // Check for skip-validation class FIRST (regardless of data-parsley-excluded)
        if ($field.hasClass('skip-validation')) {
            $field.attr('data-parsley-excluded', 'true');
            return true;
        }
        
        // Check if any ancestor col-form container has display:none
        // This targets the _cfg wrapper divs used in the form structure
        if ($field.closest('.col-form[style*="display: none"]').length > 0) {
            $field.attr('data-parsley-excluded', 'true');
            return true;
        }
    });

    var _parsley;

    if (typeof options == "undefined") {
        _parsley = $('#' + form_id).eq(0).parsley();
    } else {
        _parsley = $('#' + form_id).eq(0).parsley(options);
    }

    if (typeof _parsley == 'undefined' || typeof _parsley.validate != 'function') {
        console.warn('Parsley not initialized correctly!');
        return false;
    }

    return !!_parsley.validate({
        excluded: "input[type=button], input[type=submit], input[type=reset], input[type=hidden], [disabled], :hidden, .skip-validation"
    });
}

function modal_close(triggerEvents=true) {
    if(triggerEvents){
       xf.event.trigger('xf.modal.close', { id: modal_id });
    }
    $('#' + modal_id).remove();
    $('.modal-backdrop').remove();
    $("body").removeClass('modal-open');

    $('html').removeAttr('style');
    $('body').css('padding-right', '0px');

    /*For bugs on IOS*/
    $('body').css('position', 'relative');
    $('body').css('width', 'auto');
}

function ajax(url, container, data, action) {
    if (typeof action == "undefined") {
        var action = 'html';
    }
    if (typeof data == "undefined") {
        var data = {};
    } else if (typeof data == 'string') {
        var dataID = data;
        data = Form_Data(dataID);
    }
    return Ajax_Request(url, data, container, action)
}


function ajax_upload(url, id) {

    try {
        $(document).trigger('file_uploading');
        console.log('file_uploading');

        $(document).trigger('file_uploading_' + id);
        console.log('file_uploading_' + id);

        var data = new FormData();
        var input = $('#' + id);

        data.append(input.attr('name'), input[0].files[0]);


        var req = $.ajax({
            url: url,
            method: 'POST',
            cache: false,
            data: data,
            dataType: "json",
            contentType: false,
            processData: false,
        }).success(function (resx) {

            if (resx.status == 'ok') {
                console.log(resx.model + '_file_uploaded', resx);
                console.log(resx.model + '_file_uploaded_' + id, resx);
                $(document).trigger(resx.model + '_file_uploaded', resx);
                $(document).trigger(resx.model + '_file_uploaded_' + id, resx);
            } else if (resx.msq) {
                var msg = {};
                msg.text = resx.msq;
                msg.type = 'error';
                msg.timeout = 2000;

                Framework_Alert(msg);
            }
        }).error(function (jqXHR, textStatus, errorThrown) {
            console.warn("jqXHR:", jqXHR);
            console.warn("textStatus:", textStatus);
            console.warn("errorThrown:", errorThrown);

            var msg = "Upload error:\n"
                + "Status: " + jqXHR.status + " " + (jqXHR.statusText || textStatus ) + "\n"
                + "Details: " + (jqXHR.responseText || "N/A") + "\n";

            alert(msg);
});
    } catch (e) {
        alert('catch');
        alert(JSON.stringify(e));
    }

    return false;
}

function modal(url, data, sets) {
    if (typeof data == "undefined") {
        var data = {};
    } else if (typeof data == 'string') {
        try {
            const json = JSON.parse(data);
            console.warn(data);
        } catch (e) {
            data = Form_Data(data);
        }
    }

    var id = modal_id;

    var sets_default = {
        'modal': {
            'class': '',
            'style': '',
            'raw': ''
        },
        'dialog': {
            'class': '',
            'style': '',
            'raw': ''
        },
        'header': {
            'content': '',
            'class': '',
            'style': '',
            'raw': ''
        },
        'content': {
            'class': '',
            'style': '',
            'raw': ''
        },
        'footer': {
            'class': '',
            'style': '',
            'raw': ''
        }
    };

    var sections = ['modal', 'dialog', 'header', 'content', 'footer'];
    var params = ['class', 'style', 'raw'];

    if (typeof MODAL_DEFAULT_SETS != "undefined" && Object.values(MODAL_DEFAULT_SETS).length > 0) {
        if (typeof MODAL_DEFAULT_SETS.header != "undefined" && typeof MODAL_DEFAULT_SETS.header.content != "undefined") {
            sets_default.header.content = sets.header.content;
        }

        for (i = 0; i < sections.length; i++) {
            if (typeof MODAL_DEFAULT_SETS[sections[i]] != "undefined") {
                for (j = 0; j < params.length; j++) {
                    if (typeof MODAL_DEFAULT_SETS[sections[i]][params[j]] != "undefined") {
                        sets_default[sections[i]][params[j]] = MODAL_DEFAULT_SETS[sections[i]][params[j]];
                    }
                }
            }
        }

        if (typeof MODAL_DEFAULT_SETS.manualClose != "undefined") {
            enableModalExitOnEscKey = false;
            sets_default.modal.raw += ' data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true"';
        }
    }

    var modalContentStyle = '';

    if (typeof sets != "undefined") {
        if (typeof sets.header != "undefined" && typeof sets.header.content != "undefined") {
            sets_default.header.content = sets.header.content;
        }

        for (i = 0; i < sections.length; i++) {
            if (typeof sets[sections[i]] != "undefined") {
                for (j = 0; j < params.length; j++) {
                    if (typeof sets[sections[i]][params[j]] != "undefined") {
                        sets_default[sections[i]][params[j]] = sets[sections[i]][params[j]];
                    }
                }
            }
        }

        if (typeof sets.manualClose != "undefined") {
            enableModalExitOnEscKey = false;
            sets_default.modal.raw += ' data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true"';
        }

        if (typeof sets.preserveLastModalDimensions != "undefined") {
            if ($('#' + id + ' .modal-dialog').length > 0) {
                sets_default.dialog.style += 'max-width: ' + $('#' + id + ' .modal-dialog').width() + 'px;';
                modalContentStyle = 'height: ' + $('#' + id + ' .modal-content').height() + 'px;';
            }
        }
    }

    modal_close(false);

    var has_custom_class = '';
    if (sets_default.header.class.length) {
        has_custom_class = 'modal-has-custom-class';
    }

    var modal_html = '<div class="modal ' + has_custom_class + ' ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '><div class="modal-dialog ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '"><div class="modal-content" style="' + modalContentStyle + '"><button type="button" class="btn btn-danger close btn-modal-close" style="margin-left:10px" data-dismiss="modal" aria-hidden="true">&times;</button><div class="modal-header ' + sets_default.header.class + '" id="modal-header" style="padding:3px 5px; min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '></div><div class="modal-body ' + sets_default.content.class + '" id="' + id + 'C" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '><div style="text-align: center;"><i class="fas fa-circle-notch fa-spin" style="font-size: 30px;"></i><div style="margin-top: 15px; font-style: italic;">Loading...</div></div></div><div id="modal-footer" class="modal-footer ' + sets_default.footer.class + '" style="padding: 4px 2px 3px; ' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div></div></div>';
    if (BS_VERSION == 4) {
        modal_html = '<div class="modal ' + has_custom_class + ' ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '><div class="modal-dialog ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '"><div class="modal-content" style="' + modalContentStyle + '"><div class="modal-header ' + sets_default.header.class + '" style="min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '><h5 id="modal-header" class="modal-title">' + sets_default.header.content + '</h5><button type="button" class="close btn-modal-close" style="margin-left:10px" data-dismiss="modal" aria-hidden="true"><span aria-hidden="true">×</span></button></div><div class="modal-body ' + sets_default.content.class + '" id="' + id + 'C" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '><div class="d-flex justify-content-center align-items-center"><div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div></div></div><div id="modal-footer" class="modal-footer ' + sets_default.footer.class + '" style="' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div></div></div>';
    } else if (BS_VERSION == 5) {
        modal_html = '<div class="modal ' + has_custom_class + ' ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '><div class="modal-dialog modal-dialog-scrollable ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '"><div class="modal-content" style="' + modalContentStyle + '"><div class="modal-header ' + sets_default.header.class + '" style="min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '><h5 id="modal-header" class="modal-title">' + sets_default.header.content + '</h5><button type="button" class="close btn-close btn-modal-close" style="margin-left:10px" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body ' + sets_default.content.class + '" id="' + id + 'C" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '><div class="d-flex justify-content-center align-items-center" style="height: 100%;"><div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div></div></div><div id="modal-footer" class="modal-footer ' + sets_default.footer.class + '" style="' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div></div></div>';
    }
    $('body').append(modal_html);
    $('#' + id).on('hidden.bs.modal', function () {
        modal_close(false);
    });

    if (typeof sets != "undefined" && sets && typeof sets.confirmClose != "undefined" && sets.confirmClose === true) {
        let allowCloseModal = false;

        $('#' + id).on('hide.bs.modal', function (e) {
            if (typeof sets.confirmCloseSets != "undefined") {
                if (!allowCloseModal) {
                    e.preventDefault();

                    xf.confirm(sets.confirmCloseSets, function () {
                        allowCloseModal = true;

                        if (BS_VERSION === 5) {
                            var myModal = new bootstrap.Modal(document.getElementById(id));
                            myModal.hide();
                        } else {
                            $('#' + id).modal('hide');
                        }

                        modal_close(false);
                    });
                } else {
                    allowCloseModal = false; // reset pentru viitor
                }
            } else if (!confirm('Are you sure you want to close the modal?')) {
                e.preventDefault();
            }
        });
    }

    // Injectăm _windowId în request pentru ca PHP să știe ID-ul ferestrei curente
    // (folosit de windowHeader, windowSize, windowFooter, windowClose pentru auto-detect)
    if ($.isArray(data)) {
        data.push({ name: '_windowId', value: id });
    } else {
        if (typeof data !== 'object' || data === null) { data = {}; }
        data['_windowId'] = id;
    }

    var ret = Ajax_Request(url, data, id + 'C', 'html', 'modal');

    if (BS_VERSION === 5) {
        var myModal = new bootstrap.Modal(document.getElementById(id));
        myModal.show();

        $('html').css('overflow', 'hidden');

        $('#' + id).on('hidden.bs.modal', function () {
            $('html').removeAttr('style');
        });
    } else {
        $('#' + id).modal();
    }

    if (BS_VERSION < 4) {
        var window_height = $(window).height();
        var modal_height = (window_height - (window_height / 13) - 50);
        var content_height = (modal_height - 50);

        $('#' + id).css({
            margin: '0 auto',
            top: '15px'
        });

        $('.modal-dialog').css({
            'margin-top': '0px'
        });

        ret.done(function () {
            $('#' + id).css({
                width: '95%',
                height: modal_height + 'px',
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });

            $('.modal-dialog').css({
                width: '100%',
                height: '100%',
                padding: '0px',
            });

            var cssModalBody = {
                width: '100%',
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
                'max-height': content_height + 'px'
            };


            if (BS_VERSION !== 4) {
                cssModalBody.padding = '5px';
            }

            $('.modal-body').css(cssModalBody);


            $('body').css({
                'overflow-y': 'auto'
            });
        });

        var times = {
            300: 300,
            600: 600,
            1200: 1200,
            2000: 2000,
            60000: 60000,
        };
        for (var time in times) {
            setTimeout(function () {
                if (time == 2000) {
                    $('#' + id + ' input, #' + id + ' textarea, #' + id + ' select').on('keyup change paste', function (e) {
                        if (!modalChanged) {
                            modalChanged = true;
                        }
                    });
                }
                var manual_height = $('#' + id).attr('data-manual-height');
                if (manual_height) {
                    modal_height = manual_height;
                }

                content_height = modal_height - $('#modal-footer').outerHeight() - $('#modal-header').outerHeight();

                $('.modal-body').css('max-height', content_height + 'px');

            }, time);
        }
    } else if (modalContentStyle !== '') {
        ret.done(function () {
            $('#' + id + ' .modal-content').removeAttr('style');
        });
    }

    return ret;
}

/*
 Inchidere modal la click in afara
 $(document).on('click', function(e){
 if( $(e.target).hasClass('modal-dialog') || $(e.target).hasClass('modal-backdrop') )
 {
 $('#modal').modal('hide');
 }
 });
 */

modalChanged = false;
enableModalExitOnEscKey = true;

$(document).on('keyup', function (e) {
    if ($('#modal').length <= 0) {
        return false;
    }

    if (e.which == 27 && enableModalExitOnEscKey === true) {
        modalExit();
    }
});

function modalExit() {

    var close = true;

    if (typeof modalChanged != 'undefined' && modalChanged === true) {
        close = confirm('Are you sure you want to close the modal window without saving?');
    }

    if (close) {

        $('#modal').modal('hide');
        modalChanged = false;
    }
}

/* =========================================================
 * SUBMODAL — sistem multi-modal independent
 * Permite deschiderea mai multor modaluri simultane în pagină.
 * Nu interferează cu modal() / modal_close() existente.
 * Fiecare submodal primește un ID unic generat automat.
 * ========================================================= */

var _submodal_counter = 0;

function submodal(url, data, sets) {
    if (typeof data == "undefined") {
        data = {};
    } else if (typeof data == 'string') {
        try {
            JSON.parse(data);
        } catch (e) {
            data = Form_Data(data);
        }
    }

    // ID unic pentru fiecare submodal
    _submodal_counter++;
    var id = 'submodal_' + _submodal_counter;

    var sets_default = {
        'modal':   { 'class': '', 'style': '', 'raw': '' },
        'dialog':  { 'class': '', 'style': '', 'raw': '' },
        'header':  { 'content': '', 'class': '', 'style': '', 'raw': '' },
        'content': { 'class': '', 'style': '', 'raw': '' },
        'footer':  { 'class': '', 'style': '', 'raw': '' }
    };

    var sections = ['modal', 'dialog', 'header', 'content', 'footer'];
    var params   = ['class', 'style', 'raw'];
    var i, j;

    // Aplică MODAL_DEFAULT_SETS dacă există
    if (typeof MODAL_DEFAULT_SETS != "undefined" && Object.values(MODAL_DEFAULT_SETS).length > 0) {
        for (i = 0; i < sections.length; i++) {
            if (typeof MODAL_DEFAULT_SETS[sections[i]] != "undefined") {
                for (j = 0; j < params.length; j++) {
                    if (typeof MODAL_DEFAULT_SETS[sections[i]][params[j]] != "undefined") {
                        sets_default[sections[i]][params[j]] = MODAL_DEFAULT_SETS[sections[i]][params[j]];
                    }
                }
            }
        }
        if (typeof MODAL_DEFAULT_SETS.manualClose != "undefined") {
            sets_default.modal.raw += ' data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true"';
        }
    }

    var modalContentStyle = '';

    if (typeof sets != "undefined" && sets) {
        if (typeof sets.header != "undefined" && typeof sets.header.content != "undefined") {
            sets_default.header.content = sets.header.content;
        }
        for (i = 0; i < sections.length; i++) {
            if (typeof sets[sections[i]] != "undefined") {
                for (j = 0; j < params.length; j++) {
                    if (typeof sets[sections[i]][params[j]] != "undefined") {
                        sets_default[sections[i]][params[j]] = sets[sections[i]][params[j]];
                    }
                }
            }
        }
        if (typeof sets.manualClose != "undefined") {
            sets_default.modal.raw += ' data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true"';
        }
    }

    // Construiește HTML-ul modalului cu IDs unice bazate pe id
    var header_id = id + '-header';
    var footer_id = id + '-footer';
    var body_id   = id + 'C';

    var modal_html = '';
    if (BS_VERSION == 4) {
        modal_html = '<div class="modal ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '>'
            + '<div class="modal-dialog ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '">'
            + '<div class="modal-content" style="' + modalContentStyle + '">'
            + '<div class="modal-header ' + sets_default.header.class + '" style="min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '>'
            + '<h5 id="' + header_id + '" class="modal-title">' + sets_default.header.content + '</h5>'
            + '<button type="button" class="close btn-modal-close" data-dismiss="modal" aria-hidden="true" onclick="submodal_close(\'' + id + '\')"><span aria-hidden="true">&times;</span></button>'
            + '</div>'
            + '<div class="modal-body ' + sets_default.content.class + '" id="' + body_id + '" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '>'
            + '<div class="d-flex justify-content-center align-items-center"><div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div></div>'
            + '</div>'
            + '<div id="' + footer_id + '" class="modal-footer ' + sets_default.footer.class + '" style="' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div>'
            + '</div></div></div>';
    } else if (BS_VERSION == 5) {
        modal_html = '<div class="modal ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '>'
            + '<div class="modal-dialog modal-dialog-scrollable ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '">'
            + '<div class="modal-content" style="' + modalContentStyle + '">'
            + '<div class="modal-header ' + sets_default.header.class + '" style="min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '>'
            + '<h5 id="' + header_id + '" class="modal-title">' + sets_default.header.content + '</h5>'
            + '<button type="button" class="close btn-close btn-modal-close" data-bs-dismiss="modal" aria-label="Close" onclick="submodal_close(\'' + id + '\')"></button>'
            + '</div>'
            + '<div class="modal-body ' + sets_default.content.class + '" id="' + body_id + '" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '>'
            + '<div class="d-flex justify-content-center align-items-center" style="height:100%;"><div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div></div>'
            + '</div>'
            + '<div id="' + footer_id + '" class="modal-footer ' + sets_default.footer.class + '" style="' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div>'
            + '</div></div></div>';
    } else {
        // BS3
        modal_html = '<div class="modal ' + sets_default.modal.class + '" id="' + id + '" style="' + sets_default.modal.style + '" ' + sets_default.modal.raw + '>'
            + '<div class="modal-dialog ' + sets_default.dialog.class + '" style="' + sets_default.dialog.style + '">'
            + '<div class="modal-content" style="' + modalContentStyle + '">'
            + '<button type="button" class="btn btn-danger close btn-modal-close" style="margin-left:10px" data-dismiss="modal" aria-hidden="true" onclick="submodal_close(\'' + id + '\')">&times;</button>'
            + '<div class="modal-header ' + sets_default.header.class + '" id="' + header_id + '" style="padding:3px 5px; min-height:25px;' + sets_default.header.style + '" ' + sets_default.header.raw + '></div>'
            + '<div class="modal-body ' + sets_default.content.class + '" id="' + body_id + '" style="' + sets_default.content.style + '" ' + sets_default.content.raw + '>'
            + '<div style="text-align:center;"><i class="fas fa-circle-notch fa-spin" style="font-size:30px;"></i><div style="margin-top:15px;font-style:italic;">Loading...</div></div>'
            + '</div>'
            + '<div id="' + footer_id + '" class="modal-footer ' + sets_default.footer.class + '" style="padding:4px 2px 3px; ' + sets_default.footer.style + '" ' + sets_default.footer.raw + '></div>'
            + '</div></div></div>';
    }

    $('body').append(modal_html);

    // Auto-distruge la închidere
    $('#' + id).on('hidden.bs.modal', function () {
        submodal_close(id, false);
    });

    // confirmClose support
    if (typeof sets != "undefined" && sets && typeof sets.confirmClose != "undefined" && sets.confirmClose === true) {
        var allowClose = false;
        $('#' + id).on('hide.bs.modal', function (e) {
            if (typeof sets.confirmCloseSets != "undefined") {
                if (!allowClose) {
                    e.preventDefault();
                    xf.confirm(sets.confirmCloseSets, function () {
                        allowClose = true;
                        submodal_close(id);
                    });
                } else {
                    allowClose = false;
                }
            } else if (!confirm('Are you sure you want to close?')) {
                e.preventDefault();
            }
        });
    }

    // Injectăm _windowId în request pentru ca PHP să știe ID-ul ferestrei curente
    if ($.isArray(data)) {
        data.push({ name: '_windowId', value: id });
    } else {
        if (typeof data !== 'object' || data === null) {
            data = {};
        }
        data['_windowId'] = id;
    }

    var ret = Ajax_Request(url, data, body_id, 'html', 'modal');

    if (BS_VERSION === 5) {
        var mySubModal = new bootstrap.Modal(document.getElementById(id));
        // Salvăm instanța direct pe elementul DOM pentru a o recupera la close
        document.getElementById(id)._xfSubmodalInstance = mySubModal;
        mySubModal.show();
    } else {
        $('#' + id).modal();
    }

    // Stacking z-index: fiecare submodal și backdrop-ul lui trebuie să fie
    // deasupra tuturor modalurilor deja deschise.
    // Bazăm pe numărul de .modal vizibile ÎNAINTE de cel curent.
    (function stackSubmodalZIndex(modalId) {
        // Așteptăm ca Bootstrap să adauge clasa 'show' și backdrop-ul
        setTimeout(function () {
            var zBase = 2040;
            var zStep = 20; // pas între modal și backdrop: modal=+10, backdrop=+0
            // Numărăm câte modaluri sunt deja vizibile (inclusiv cel curent)
            var openModals = $('.modal.show, .modal.in').length;
            // Al câtelea e cel curent (1-based)
            var myIndex = 0;
            $('.modal.show, .modal.in').each(function (i) {
                if ($(this).attr('id') === modalId) {
                    myIndex = i + 1;
                }
            });
            if (myIndex === 0) { return; } // nu a apărut încă, nimic de făcut

            var modalZ  = zBase + (myIndex - 1) * zStep + 10;
            var backdropZ = zBase + (myIndex - 1) * zStep;

            // Setăm z-index pe modal
            $('#' + modalId).css('z-index', modalZ);

            // Backdrop-urile sunt adăugate în body în ordine — luăm ultimul backdrop
            var backdrops = $('.modal-backdrop');
            // Atribuim z-index progresiv tuturor backdrop-urilor existente
            backdrops.each(function (i) {
                $(this).css('z-index', zBase + i * zStep);
            });
        }, 50);
    })(id);

    xf.event.trigger('xf.submodal.open', { id: id });

    return { ret: ret, id: id };
}

function submodal_close(id, triggerEvents) {
    if (typeof triggerEvents === 'undefined') {
        triggerEvents = true;
    }
    if (triggerEvents) {
        xf.event.trigger('xf.submodal.close', { id: id });
    }
    var el = document.getElementById(id);
    if (!el) { return; }

    // Funcție internă de cleanup după ce Bootstrap a terminat animația de hide
    function _submodal_cleanup() {
        // Eliminăm elementul din DOM
        $(el).remove();

        // Recalculăm câte modaluri rămân deschise (fără cel pe care tocmai l-am șters)
        var remaining = $('.modal.show, .modal.in');
        // Numărul de backdropuri trebuie să coincidă cu numărul de modaluri rămase
        var backdrops = $('.modal-backdrop');

        if (remaining.length === 0) {
            // Niciun modal rămas — curățăm tot
            $('body').removeClass('modal-open');
            backdrops.remove();
            $('html').removeAttr('style');
        } else {
            // Mai sunt modaluri — eliminăm backdropurile în exces
            // (trebuie să rămână exact câte modaluri sunt deschise)
            var excess = backdrops.length - remaining.length;
            if (excess > 0) {
                // Eliminăm ultimele backdrop-uri (cele cu z-index mai mare = ale submodalelor închise)
                backdrops.slice(backdrops.length - excess).remove();
            }
            // Re-aplicăm z-index-urile corect
            var zBase = 2040, zStep = 20;
            $('.modal-backdrop').each(function (i) {
                $(this).css('z-index', zBase + i * zStep);
            });
            remaining.each(function (i) {
                $(this).css('z-index', zBase + i * zStep + 10);
            });
            // Asigurăm că body rămâne modal-open
            $('body').css('padding-right', '');
        }
    }

    if (BS_VERSION === 5) {
        // Recuperăm instanța salvată la deschidere sau o căutăm via BS API
        var instance = el._xfSubmodalInstance || bootstrap.Modal.getInstance(el);

        if (instance && $(el).hasClass('show')) {
            // Modalul e vizibil — lăsăm Bootstrap să facă hide animat,
            // și curățăm în hidden.bs.modal
            $(el).one('hidden.bs.modal', function () {
                try { instance.dispose(); } catch(e) {}
                _submodal_cleanup();
            });
            instance.hide();
        } else {
            // Modalul nu e vizibil (deja ascuns de BS sau niciodată arătat)
            // Dispose dacă există instanță
            if (instance) {
                try { instance.dispose(); } catch(e) {}
            }
            _submodal_cleanup();
        }
    } else {
        // BS3/BS4
        if ($(el).hasClass('in') || $(el).css('display') !== 'none') {
            $(el).one('hidden.bs.modal', function () {
                _submodal_cleanup();
            });
            $(el).modal('hide');
        } else {
            _submodal_cleanup();
        }
    }
}

/* =========================================================
 * END SUBMODAL
 * ========================================================= */

function tab_remove(e) {
    var bool = true;
    var for_remove;
    var curent = 0;
    var remove;
    var count = 0;
    $('#' + $(e).closest('.tab').attr('id') + '> ul > li').each(function () {
        ++count;
        if ($(this).hasClass('active') && bool) {
            curent = count;
            for_remove = $(this);
            bool = false;
        }
    });
    $(for_remove.find('a').attr('href')).remove();
    for_remove.parent().find('li').eq(curent == 1 ? 1 : 0).find('a').trigger('click');
    for_remove.remove();
}

function deprecated(name, new_name) {
    xf.console('JS: DEPRECATED: ' + name + '(), USE: ' + new_name + '()');
}

/**deprecated**/

function UserConfig(key, value) {
    deprecated('UserConfig', 'uconfig');
    ajax(BASE_URL + '/sys/user_config/?key=' + key + '&value=' + value);
}

function Validate_Form(form_id) {
    deprecated('Validate_Form', 'validate');
    form_id = form_id.replace('#', '');
    if ($('#' + form_id).parsley().validate()) {
        return true;
    }
    return false;
}

function ValidateForm(form_id) {
    deprecated('ValidateForm', 'validate');
    return Validate_Form();
}

function CloseModal() {
    deprecated('CloseModal', 'modal_close');
    var id = modal_id;
    $('#' + id).remove();
    $('.modal-backdrop').remove();
}

function Ajax_Modal(url, data) {
    deprecated('Ajax_Modal', 'modal');
    if (typeof data == "undefined") {
        var data = {};
    } else if (typeof data == 'string') {
        data = Form_Data(data);
    }
    var id = modal_id;
    $('body').append('<div class="modal fade" id="' + id + '"><div class="modal-dialog"><div class="modal-content"><button type="button" class="btn btn-danger close btn-modal-close" style="margin-left:10px" data-dismiss="modal" aria-hidden="true">&times;</button><div class="modal-header" id="modal-header" style="padding:3px 5px; min-height:25px;"></div><div class="modal-body" id="' + id + 'C"></div><div id="modal-footer" class="modal-footer" style="padding: 4px 2px 3px;"></div></div></div>');
    $('#' + id).on('hidden.bs.modal', function () {
        $('#' + id).remove();
    });
    Process_Ajax(url, id + 'C', 'modal', data);
    var window_height = $(window).height();
    var modal_height = (window_height - (window_height / 13));
    var content_height = (modal_height - (modal_height / 8));

    var header_height = $('#modal-header').height();
    var footer_height = $('#modal-footer').height();

    $('#' + id).modal().css({
        width: '95%',
        height: modal_height + 'px',
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
        margin: '0 auto',
        top: '15px'
    });
    $('.modal-dialog').css({
        width: '99%',
        height: '99%',
        'margin-top': '0px',
        padding: '0px',
    });
    $('.modal-body').css({
        width: '100%',
        padding: '5px',
        'overflow-x': 'hidden',
        'overflow-y': 'auto',
        'max-height': content_height + 'px'
    });
    $('body').css({
        'overflow-y': 'auto'
    });
    return false;
}

function showPopupParsleyErrors() {
    var fields = $('.parsley-error');
    console.log(fields);

    var alert = {};
    alert.title = (LANG=='ro')? 'Validare esuata!' : 'Please check the form for errors!';
    alert.type = 'error';

    if (fields?.length > 0) {
        var message = [];

        fields.map(function() {
            var errors = $(this).parent().find('.parsley-errors-list');

            if (errors?.length > 0) {
                var fieldErrors = '';
                var fieldLabel = $(this).find('label');
                if (fieldLabel?.length > 0) {
                    fieldErrors = '<b>' + fieldLabel.text() + '</b><br/>';
                }

                fieldErrors += errors.html();

                message.push(fieldErrors);
            }
        });

        if (message.length > 0) {
            alert.message = message.join('<br/>');
        }
    }

    xf.alert(alert);
}

function ModelSaveHtml(model, id, link, action, override) {
    if (typeof action == "undefined") {
        var action = 'save';
    }
    if (typeof override == "undefined") {
        var override = 0;
    }
    var form_id = '#form-' + model + '-edit-' + id;
    if (validate(form_id)) {
        if (override == 1) {
            $(form_id).append('<input type=hidden name=override value=1 />');
        }

        mod_crud_changes[form_id] = false;
        $(form_id + ' .panel-child').remove();
        $(form_id).append('<input type=hidden name=_action value=' + action + ' />');

        var btn = $('#' + model + '-' + id + '-panel-edit-btn-save');
        if (btn.length) {
            xf.btnLoading(btn);
        }

        $(form_id).submit();
    } else {
        showPopupParsleyErrors();

        var msg = {};
        msg.title = LANG=='ro' ?  'Validare esuata!': 'Please check the form for errors!';
        msg.type = 'error';
        Framework_Alert(msg);
        return false;
    }
}

function ModelSaveAjax(model, id, link, _c) {
    var form_id = 'form-' + model + '-edit-' + id;
    if (validate(form_id)) {
        mod_crud_changes[form_id] = false;
        $('#' + form_id + ' .panel-child').remove();
        var btn = $('#' + model + '-' + id + '-panel-edit-btn-save');
        if (btn.length) {
            if (btn.hasClass('disabled')) {
                return false;
            }

            xf.btnLoading(btn);

            var btnDropdown = $('#dropdown-' + model + '-' + id + '-panel-edit-btn-save');
            if (btnDropdown.length) {
                btnDropdown.addClass('disabled');
            }
        }

        ajax(link, _c, Form_Data(form_id)).done(function (r) {
            if (btn.length) {
                if (BS_VERSION === 5) {
                    btn.removeClass('disabled');

                    if (btnDropdown.length) {
                        btnDropdown.removeClass('disabled');
                    }
                } else {
                    xf.btnReset(btn);
                }
            }
        });
    } else {
        showPopupParsleyErrors();

        var msg = {};
        msg.title = (LANG=='ro')? 'Validare esuata!' : 'Please check the form for errors!';
        msg.type = 'error';
        Framework_Alert(msg);
        return false;
    }
    return false;
}

function ModelSaveModal(model, id, link, _c) {
    link = link.replace('_c=', '____c=');
    var form_id = 'form-' + model + '-edit-' + id + '';
    if (validate(form_id)) {
        mod_crud_changes[form_id] = false;
        $('#' + form_id + ' .panel-child').remove();

        var btn = $('#' + model + '-' + id + '-panel-edit-btn-save');
        if (btn.length) {
            if (btn.hasClass('disabled')) {
                return false;
            }
            xf.btnLoading(btn);

            var btnDropdown = $('#dropdown-' + model + '-' + id + '-panel-edit-btn-save');
            if (btnDropdown.length) {
                btnDropdown.addClass('disabled');
            }
        }

        modal(link, Form_Data(form_id)).done(function (r) {
            if (btn.length) {
                xf.btnReset(btn);

                var btnDropdown = $('#dropdown-' + model + '-' + id + '-panel-edit-btn-save');
                if (btnDropdown.length) {
                    btnDropdown.addClass('disabled');
                }
            }
        });
    } else {
        showPopupParsleyErrors();

        var msg = {};
        msg.title = (LANG=='ro')? 'Validare esuata!' : 'Please check the form for errors!';
        msg.type = 'error';
        Framework_Alert(msg);
        return false;
    }
    return false;
}

function ModelSaveWindow(model, id, link, _c, win_id) {
    link = link.replace('_c=', '____c=');
    var form_id = 'form-' + model + '-edit-' + id + '';
    if (validate(form_id)) {
        mod_crud_changes[form_id] = false;
        $('#' + form_id + ' .panel-child').remove();
        var data = Form_Data(form_id);
        xf.window_close(win_id);

        xf.window(link, data);
    } else {
        showPopupParsleyErrors();

        var msg = {};
        msg.title = (LANG=='ro')? 'Validare esuata!' : 'Please check the form for errors!';
        msg.type = 'error';
        Framework_Alert(msg);
        return false;
    }
    return false;
}

function formDataToKeyValue(data) {
    var result = {};
    data.map(function (item) {
        if (item.name.includes('[')) {
            //var name= item.name.substring(0, item.name.indexOf('['));
            //atentie la medanima calendar, nu am reusit sa fac sa trimita cu []
            var name = item.name;
            if (!result[name]) {
                result[name] = [];
            }
            result[name].push(item.value);
        } else {
            result[item.name] = item.value;
        }

    });

    return result;
}

function Form_Data(form) {
    if (typeof tinyMCE != "undefined") {
        tinyMCE.triggerSave();
    }

    var data = [];
    if (form.length > 1) {
        var data = $('#' + form).find("select, textarea, input").serializeArray();
        $('#' + form).find("input:checkbox:not(:checked)").each(function () {
            data.push({
                name: this.name,
                value: 0
            });
        });
    }

    return data;
}

function Ajax(url, container, data, action) {
    deprecated('Ajax', 'ajax');
    if (typeof action == "undefined") {
        var action = 'html';
    }
    if (typeof data == "undefined") {
        var data = {};
    } else if (typeof data == 'string') {
        data = Form_Data(data);
    }
    return Ajax_Request(url, data, container, action)
}

function detectIE() {

    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        /* IE 10 or older => return version number */
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        /* IE 11 => return version number */
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        /* Edge (IE 12+) => return version number */
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    /* other browser */
    return 0;
}

if (detectIE() >= 13) {
    (function () {
        function CustomEvent(event, params) {
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };

            if (typeof params.bubbles == 'undefined') {
                params.bubbles = false;
            }

            if (typeof params.cancelable == 'undefined') {
                params.cancelable = false;
            }

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }


        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();

    xf.customEvents = true;
} else if (detectIE() > 0) {
    xf.customEvents = false;
}

function Ajax_Request(url, param, extra, action, _output) {
    if (typeof _output == "undefined") {
        var _output = 'ajax';
    }

    if (typeof xf.customEvents != 'undefined' && xf.customEvents == true && typeof CustomEvent != "undefined" && CustomEvent) {
        var xfajaxdata = {
            url: url,
            param: param,
            extra: extra,
            action: action,
            output: _output
        };

        var ajaxStartEvent = new CustomEvent('xf.ajax.start', {
                detail: xfajaxdata
            }),
            ajaxDoneEvent = new CustomEvent('xf.ajax.done', {
                detail: xfajaxdata
            }),
            ajaxErrorEvent = new CustomEvent('xf.ajax.error', {
                detail: xfajaxdata
            });
    } else {
        xf.customEvents = false;
    }

    if (typeof action == "undefined") {
        var action = 'html';
    }
    if ($.type(extra) === "string") {
        var _c = extra;
    } else if (typeof extra == 'object') {
        var _c = extra._c;
    } else if (typeof extra == 'undefined') {
        var _c = false;
    }
    if ($.isArray(param)) {
        param.push({
            "name": "_output",
            "value": _output
        });
        param.push({
            "name": "_isFe",
            "value": IS_FRONTEND
        });
        if (_c && _c.length > 0) {
            param.push({
                "name": "_c",
                "value": _c
            });
        }

    } else {
        param['_output'] = _output;
        param['_isFe'] = IS_FRONTEND;
        if (_c && _c.length > 0) {
            param['_c'] = _c;
        }
        ;
    }

    if (_c.length > 0) {
        htmlLoading = '<div class="ajax_loading"  style="width:80px; margin:0 auto; position:fixed; top:4px; left:44%; z-index:1090; background-color: #F0AD4E; color:#FFFFFF "><i class="fa fa-refresh fa-spin"></i><span> Loading...</span></div>';

        if (xf.customEvents) {
            document.dispatchEvent(ajaxStartEvent);
        }

        if (_output == 'modal') {
            //$('#modalC').html(htmlLoading);
        } else {
            $('body').append(htmlLoading);
        }
    }

    if (url.indexOf("?") != -1) {
        url = url + '&_nocache=' + Math.round(Math.random() * 10000);
    } else {
        url = url + '?_nocache=' + Math.round(Math.random() * 10000);
    }
    $.ajaxSetup({
        cache: false
    });

    var time = Date.now();
    return $.ajax({
        async: true,
        url: url,
        type: "POST",
        cache: false,
        data: param,
        dataType: "json",
        error: function (resx) {
            var diff = Date.now() - time;
            if (diff < 30) {
                return;
            }
            htmlError = '<div class="ajax_error"  style="width:120px; margin:0 auto; position:fixed; text-align:center; top:4px; left:44%; z-index:999990; background-color: red; color:white "><i class="fa fa-exclamation-triangle"></i><span> Request Error!</span></div>';
            console.log('resx', resx);
            if (xf.customEvents)
                document.dispatchEvent(ajaxErrorEvent);

            $('.ajax_loading').remove();

            if (_output == 'modal') {
                modal_close(false);
            }
            $('body').append(htmlError);
            $('.ajax_error').fadeOut(3000);
        },
        timeout: function (resx) {
            console.log('ajax timeout');

            if (xf.customEvents)
                document.dispatchEvent(ajaxErrorEvent);
        },
        success: function (resx) {

            var js_files_toload = 0,
                js_files_timestamps = {};

            if (resx) {
                if (resx.js_file) {
                //atentie sa se incarce in ordinea care trebuie, varianta anterioara le incarca asincron si in ordinea in care se incarca mai rapid
                    (async function() {
                        for (const [key, value] of Object.entries(resx.js_file)) {
                            let cleanKey = key.split('?')[0];

                            if (typeof js_files[cleanKey] !== 'undefined')
                                continue;

                            let skip = false;
                            for (var it in js_files) {
                                if (cleanKey === it.split('?')[0]) {
                                    skip = true;
                                    break;
                                }
                            }
                            if (skip) continue;

                            js_files_toload++;
                            js_files_timestamps[cleanKey] = { start: +new Date() };
                            js_files[cleanKey] = { from_ajax: true, loading: true };

                            try {
                                await $.getScript(cleanKey);
                                js_files_toload--;
                                js_files_timestamps[cleanKey].end = +new Date();
                                js_files_timestamps[cleanKey].duration = js_files_timestamps[cleanKey].end - js_files_timestamps[cleanKey].start;
                                js_files[cleanKey] = {
                                    from_ajax: true,
                                    timestamp: js_files_timestamps[cleanKey]
                                };
                                console.log(cleanKey + " (" + js_files_timestamps[cleanKey].duration + " milliseconds)");
                            } catch (e) {
                                console.error("Failed to load: " + cleanKey, e);
                            }
                        }
                    })();
//                    $.each(resx.js_file, function (key, value) {
//                        /*js_loaded += js_file(key, value);*/
//
//                        key = key.split('?')[0];
//
//                        if (typeof js_files[key] != 'undefined')
//                            return;
//
//                        for (var it in js_files) {
//                            if (key == it.split('?')[0])
//                                return;
//                        }
//
//                        js_files_toload++;
//
//                        js_files_timestamps[key] = {};
//                        js_files_timestamps[key].start = +new Date();
//
//                        js_files[key] = {
//                            from_ajax: true,
//                            loading: true
//                        };
//
//                        $.getScript(key).done(function (script, textStatus) {
//                            js_files_toload--;
//                            js_files_timestamps[key].end = +new Date();
//                            js_files_timestamps[key].duration = js_files_timestamps[key].end - js_files_timestamps[key].start;
//
//                            js_files[key] = {
//                                from_ajax: true,
//                                timestamp: js_files_timestamps[key]
//                            };
//
//                            console.log(key + " (" + js_files_timestamps[key].duration + " milliseconds)");
//                        });
//
//                    });

                }
                if (resx.css_file) {
                    $.each(resx.css_file, function (key, value) {
                        css_file(key, value);
                    });
                }
                if (resx._c) {
                    $.each(resx._c, function (key, value) {
                        key = String(key);
                        value = String(value);

                        if (key.length > 0 && value.length > 0) {
                            /*var selector = '[id=' + key + ']';*/
                            var selector = '#' + key;
                            if (action == 'html') {
                                $(selector).html(value);
                            } else if (action == 'append') {
                                $(selector).append(value);
                            } else if (action == 'prepend') {
                                $(selector).prepend(value);
                            } else if (action == 'val') {
                                $(selector).val(value);
                            } else if (action == 'wrap') {
                                $(selector).wrap(value);
                            } else if (action == 'replaceWith' || action == 'replace') {
                                $(selector).replaceWith(value);
                            } else {
                                $(selector).html(value);
                            }
                        }
                    });
                }
                if (resx.css_block) {
                    var css_block = '';
                    $.each(resx.css_block, function (key, value) {
                        if (value.length > 3) {
                            css_block = css_block + value + "\n";
                        }
                    });
                    if (css_block.length > 10) {
                        css_block = '<style type="text/css">';
                        css_block = css_block + '</style>';
                        $('head').append(css_block);
                    }
                }

                if (resx.eval) {

                    var evalInterval = setInterval(function () {

                        var stillLoading = false;
                        for (var key in js_files) {
                            if (js_files[key] && js_files[key].loading) {
                                stillLoading = true;
                                break;
                            }
                        }
                        if (stillLoading)
                            return;

                        $.each(resx.eval, function (key, value) {
                            if (typeof js_blocks == 'undefined') {
                                js_blocks = [];
                            }

                            try {
                                eval(value);
                                js_blocks.push({
                                    code: value,
                                    status: true
                                });
                            } catch (e) {
                                /*
                                 //if( Bugsnag ) {
                                 //Bugsnag.notifyException(e, "JsBlockError");
                                 //}
                                 //
                                 */
                                console.error('js_block ' + e + ' | code: ' + value);
                                js_blocks.push({
                                    code: value,
                                    status: false
                                });
                            }
                        });

                        clearInterval(evalInterval);

                    }, 10);

                    setTimeout(function () {
                        /*clearInterval(evalInterval);*/
                        js_files_toload = 0;
                    }, 5000);

                    /*
                     if ( js_loaded > 0 ) {
                     setTimeout(function() {
                     $.each(resx.eval, function(key, value) {
                     eval(value);
                     });
                     }, 500)
                     } else {
                     $.each(resx.eval, function(key, value) {
                     eval(value);
                     });
                     }
                     */
                }
                if (_c.length > 0) {
                    $('.ajax_loading').remove();

                    if (xf.customEvents)
                        document.dispatchEvent(ajaxDoneEvent);
                }

                if (_output == 'window') {
                    if ($.isArray(param)) {
                        $("#" + param['win_id']).dialog({
                            position: {
                                my: "center",
                                at: "center",
                                of: window
                            }
                        });
                    } else {
                        $("#" + param.win_id).dialog({
                            position: {
                                my: "center",
                                at: "center",
                                of: window
                            }
                        });
                    }
                }

            }
        }
    });
}

function Framework_Alert(msg) {
    if (typeof window.Custom_Alert == 'function') {
        Custom_Alert(msg);
    } else {
        $.noty.defaults = {
            layout: 'topRight',
            theme: 'defaultTheme',
            type: 'alert',
            text: '',
            dismissQueue: true,
            template: '<div class="noty_message noty_' + msg.type + '"><span class="noty_text"></span><div class="noty_close"></div></div>',
            animation: {
                open: {
                    height: 'toggle'
                },
                close: {
                    height: 'toggle'
                },
                easing: 'swing',
                speed: 500
            },
            timeout: 5000,
            force: false,
            modal: false,
            maxVisible: 5,
            closeWith: ['button'],
            callback: {
                onShow: function () {
                },
                afterShow: function () {
                },
                onClose: function () {
                },
                afterClose: function () {
                }
            },
            buttons: false
        };
        if (msg.type == 'info') {
            msg.type = 'information';
        }
        var n = noty({
            text: msg.title,
            type: msg.type,
            timeout: msg.timeout,
        });
    }
}


function Process_Ajax(url, container, output, data) {
    deprecated('Process_Ajax', 'Ajax_Request');
    if (typeof data == 'undefined') {
        var data = {};
    }

    if (xf.customEvents && typeof CustomEvent != 'undefined' && CustomEvent) {
        var ajaxStartEvent = new CustomEvent('xf.ajax.start', {
                "container_id": container
            }),
            ajaxDoneEvent = new CustomEvent('xf.ajax.done', {
                "container_id": container
            }),
            ajaxErrorEvent = new CustomEvent('xf.ajax.error', {
                "container_id": container
            });
    } else {
        xf.customEvents = false;
    }

    if ($.isArray(data)) {
        data.push({
            "name": "_output",
            "value": output
        });
        if (container && container.length > 0) {
            data.push({
                "name": "_c",
                "value": container
            });
        }
        ;
    } else {
        data['_output'] = output;
        if (container && container.length > 0) {
            data['_c'] = container;
        }
        ;
    }
    if (container.length > 0) {
        $("#" + container).html('<div class="ajax_loading" align="center" "><span class="btn"><span class="fa fa-refresh fa-spin"></span> Loading...<span></div>');

        if (xf.customEvents)
            document.dispatchEvent(ajaxStartEvent);
    }
    if (url.indexOf("?") != -1) {
        url = url + '&_nocache=' + Math.round(Math.random() * 10000);
    } else {
        url = url + '?_nocache=' + Math.round(Math.random() * 10000);
    }
    $.ajaxSetup({
        cache: false,
        async: true
    });
    $.ajax({
        url: url,
        type: "POST",
        async: true,
        cache: false,
        data: data,
        dataType: "json",
        success: function (resx) {
            if (resx) {
                if (resx.js_file) {
                    $.each(resx.js_file, function (key, value) {
                        /*js_file(key, value);*/
                    });
                }
                if (resx.css_file) {
                    $.each(resx.css_file, function (key, value) {
                        /*css_file(key, value);*/
                    });
                }
                if (resx._c) {
                    $.each(resx._c, function (key, value) {
                        if (value != null && value.length > 0) {
                            $("#" + key).html(value);
                        }
                    });
                }
                if (resx.eval) {
                    $.each(resx.eval, function (key, value) {
                        eval(value);
                    });
                }
                if (output == 'window') {
                    if ($.isArray(data)) {
                        $("#" + data['win_id']).dialog({
                            position: {
                                my: "center",
                                at: "center",
                                of: window
                            }
                        });
                    } else {
                        $("#" + data.win_id).dialog({
                            position: {
                                my: "center",
                                at: "center",
                                of: window
                            }
                        });
                    }
                }
            }
        }
    });
}

function css_file(filename, obj) {
    filename = filename.toString();
    filename = filename.split('?')[0];

    if (typeof css_files[filename] == "undefined") {

        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref);
        css_files[filename] = 2;
        console.log(filename);

    }
}

function js_file(filename, obj) {

    filename = filename.split('?')[0];

    if (typeof js_files[filename] == "undefined") {
        addScript(filename);
        return 1;

        /*
         $.ajax({
         async : false,
         type : 'GET',
         url : filename,
         data : null,
         dataType : 'script',
         success : function() {
         js_files[filename] = 1;

         }
         });*/
    }
    return 0;
}

function field_max_length_info(e, limit) {
    var input_value = $(e).val();
    var length = input_value.length;
    var limitx = limit - 1;
    if (length >= limitx) {
        input_value = input_value.substr(0, limit);
        $(e).val(input_value);
        length = limit;
    }
    $(e).parent().find('.help-block').remove();
    $(e).parent().append('<span class="help-block">Mai aveti ' + parseInt(limitx - length + 1) + ' din ' + limit + ' caractere</span>');
    $(e).focus();
}

function make_slick(id) {
    $('#' + id).ddslick({
        width: '100%',
        imagePosition: 'left',
        selectText: 'Upload images',
        onSelected: function (data) {
            var idx = id.replace(id.substr(-7), '');
            $('#' + idx).val(data.selectedData.value);
            var init = $('#' + idx).attr('init');
            if (init == 1) {
                $('#' + id).trigger('change');
            } else {
                $('#' + id).attr('init', 1);
            }
        }
    });
}

function loadJsFile(url) {
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
            }
        };
    } else {
        script.onload = function () {
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    js_files[url] = 1;
    console.log(url);
}

function addScript(filepath) {
    if (filepath) {
        var fileref = document.createElement('script');
        var done = false;
        var head = document.getElementsByTagName("head")[0];

        fileref.onload = fileref.onreadystatechange = function () {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = true;
                /* Handle memory leak in IE */
                fileref.onload = fileref.onreadystatechange = null;
                if (head && fileref.parentNode) {
                    head.removeChild(fileref);
                }
            }
        };

        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filepath);

        head.appendChild(fileref);
        js_files[filepath] = 2;
        console.log(filepath);

    }

}

/****MOD CRUD***/
function mod_crud_toggle(obj) {
    var id = $(obj).attr('data-id');
    var model = $(obj).attr('data-model');
    var field = $(obj).attr('data-field');
    var value = $(obj).attr('data-value');

    if (value == 0) {
        var set_value = 1;
        var add_class = 'btn-success';
        var rem_class = 'btn-warning';
        var add_icon = 'fa fa-toggle-on';
        var rem_icon = 'fa fa-toggle-off';
    } else {
        var set_value = 0;
        var add_class = 'btn-warning';
        var rem_class = 'btn-success';
        var add_icon = 'fa fa-toggle-off';
        var rem_icon = 'fa fa-toggle-on';
    }
    $(obj).removeClass(rem_class).addClass(add_class).attr('data-value', set_value);
    $(obj).find('i').removeClass(rem_icon).addClass(add_icon);

    var url = BASE_URL + '/sys/edit/?_m=' + model + '&id=' + id + '&_action=save&_Button_ToggleRow=1&' + field + '=' + set_value;
    ajax(url);
}

function mod_crud_fixed_panel() {
    var window_h = $(window).height();

    if ($(".panel-main").length > 0) {

        var yOffset = $(".panel-main").offset().top,
            navbar = $('#navbar'),
            panelHeight = $('.panel-heading').eq(0).outerHeight(),
            panelMainWidth = $('.panel-main').width();

        if (navbar && navbar.length > 0 && navbar.hasClass('navbar-fixed-top')) {
            yOffset -= navbar.outerHeight();
        }

        $(window).scroll(function () {
            var window_position = $(window).scrollTop();

            if (window_position > yOffset) {
                $(".panel-main .panel-heading:first").addClass("panel-fixed").innerWidth(panelMainWidth);
                if ($('#body.framework4').length == 0) {
                    $('.panel-main').css('padding-top', panelHeight);
                }
            } else {
                $(".panel-main .panel-heading:first").removeClass("panel-fixed").css('width', 'unset');
                $('.panel-main').css('padding-top', 0);
            }
        });

        $(window).trigger('scroll');
    }
}

function btnDeleteRow(link, t) {
    if (confirm('Are you sure?')) {
        $(t).find('i').removeClass('fa-trash-o').addClass('fa-spin fa-refresh');
        ajax(link).done(function (r) {
            if (typeof r.delete_row != 'undefined') {
                $(t).closest("div[role=\'row\']").remove();
                $(t).closest("tr").remove();
            } else {
                $(t).find('i').addClass('fa-trash-o').removeClass('fa-spin fa-refresh');
            }
        });
    }
    return false;
}

function pre(pre) {
    console.log(pre);
}
