Forms = (function() {
    var fieldUniqueCounter = 1;
    var formsList = {};
    var tagsArr = ['input', 'textarea', 'select'];
    var defaults = {
        hideClass : 'h',
        classes : {
            error : 'error',
            warning : 'warning'
        },
        errorClass : 'error',
        warningClass : 'warning',
        templateFast : {
            select : function(name, id, elements) {
                var str = '<select name="' + name + '" id="' + id + '">';

                for (var i = 0; i < elements.length; i++) {
                    str += elements[i]['input']
                }

                str += '</select>';

                return str;
            },
            radio : function(name, id, elements) {
                var str = '<table cellpadding="0" cellspacing="0" class="radio-table">';

                for (var i = 0; i < elements.length; i++) {
                    str += '<tr>' +
                            '<td class="radiobutton">' +
                                 elements[i]['input'] +
                            '</td>' +
                            '<td class="radio_label">' +
                                 elements[i]['label'] +
                            '</td>' +
                        '</tr>'
                }

                str += '</table>';

                return str;
            },
            checkbox : function(name, id, elements) {
                var str = '<table cellpadding="0" cellspacing="0" class="radio-table">';

                for (var i = 0; i < elements.length; i++) {
                    str += '<tr>' +
                        '<td class="checkbox">' +
                        elements[i]['input'] +
                        '</td>' +
                        '<td class="checkbox_label">' +
                        elements[i]['label'] +
                        '</td>' +
                        '</tr>'
                }

                str += '</table>';

                return str;
            }
        },
        ajax : function(url, method, data, successCallback, errorCallback) {
            var request = new XMLHttpRequest();

            request.open(method, url);
            request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
            request.setRequestHeader('X-Requested-With','XMLHttpRequest');
            request.send(fieldValue.serialize(data, null));

            request.onreadystatechange = function() {
                if (request.status == 200 && request.readyState == 4) {
                    successCallback(request.response);
                }
                if (request.status != 200) {
                    errorCallback()
                }
            };
        },
        onChange : function(a,b) {},
        submitCallback : function(a,b,c) {
            c();
            return !0;
        },
        validateCallback : function(a) {
            return !0;
        },
        beforeSubmitCallback : function(c) {
            c();
            return !0;
        },
        afterSubmitCallback : function() {
            return !0;
        }
    };

    var FLAG_UNIQUE_LABELS = 1,
        FLAG_DEBUG = 2,
        FLAG_SUBMIT_EMPTY = 4,
        FLAG_ASYNC = 8;

    var PARAM_ID = 'id',
        PARAM_OBJ = 'obj',
        PARAM_METHOD = 'method',
        PARAM_FLAGS = 'flags',
        PARAM_ON_SUBMIT = 'onSubmit',
        PARAM_BEFORE_SUBMIT = 'beforeSubmit',
        PARAM_SUBMIT_CALLBACK = 'submitCallback',
        PARAM_ERROR_CALLBACK = 'errorCallback',
        PARAM_AFTER_SUBMIT = 'afterSubmit',
        PARAM_FIELDS = 'fields',
        PARAM_VALIDATION_TYPE = 'validationType',
        PARAM_ON_FIELD_CHANGE = 'onFieldChange',
        PARAM_ON_CHANGE = 'onChange',
        PARAM_ON_VALIDATE = 'onValidate',
        PARAM_DATA = 'data',
        PARAM_TEMPLATES = 'templates',
        PARAM_PARAMS = 'params',
        PARAM_ACTION = 'action';

    var DATA_TYPE_ATTRIBUTES = 'attributes',
        DATA_TYPE_TYPE = 'type',
        DATA_TYPE_VALIDATE = 'validate',
        DATA_TYPE_CLASS = 'class',
        DATA_TYPE_BITMASK = 'bitmask',
        DATA_TYPE_DISABLED = 'disabled',
        DATA_TYPE_WARNING = 'warning';

    var FIELD_TYPE_CONTAINER = 'field',
        FIELD_TYPE_WARNING = 'warning',
        FIELD_TYPE_ERROR = 'error',
        FIELD_TYPE_LABEL = 'label';

    var MSG_NO_CONFIG = 'No configuration passed',
        MSG_INITIALIZED = 'Form is initialized already',
        MSG_NO_ELEMENT  =   'No such element on the page';

    var VALIDATION_ON_SUBMIT = 1,
        VALIDATION_ON_CHANGE = 2,
        VALIDATION_ON_KEYUP = 3;

    var VALIDATION_KEY_TEST = 2,
        VALIDATION_KEY_ERR = 0,
        VALIDATION_KEY_WARN = 1;

    var validate = {
        setWarningMessage : function(name, msg) {
            if (!validate.methods[name]) validate.methods[name] = [];
            validate.methods[name][VALIDATION_KEY_WARN] = msg
        },
        setErrorMessage : function(name, msg) {
            if (!validate.methods[name]) validate.methods[name] = [];
            validate.methods[name][VALIDATION_KEY_ERR] = msg
        },
        setTestFunction : function(name, func) {
            if (!validate.methods[name]) validate.methods[name] = [];
            validate.methods[name][VALIDATION_KEY_TEST] = func
        },
        set : function(name, data) {
            validate.methods[name] = data
        },
        remove : function(name) {
            delete validate.methods[name]
        },
        methods : {
            'multiple' : [
                'Must be a multiple of {val}',
                'Should be a multiple of {val}',
                function(val, rule) {
                    return val%rule === 0;
                }
            ],
            'email' : [
                'Wrong email format',
                'Bad email format',
                function(val, rule) {
                    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
                }
            ],
            'int' : [
                'Must be an integer',
                'Should be an integer',
                function(val, rule) {
                    return parseInt(val, 10) == val;
                }
            ],
            'float' : [
                'Must be a decimal',
                'Should be a decimal',
                function(val, rule) {
                    return /^-?\d{0,}([\.|\,]\d{0,})?$/.test(val);
                }
            ],
            'min' : [
                'Must be >= {val}',
                'Value is lower than {val}',
                function(val, rule) {
                    return (parseFloat(val) || 0) >= (parseFloat(rule) || 0)
                }
            ],
            'max' : [
                'Must be <= {val}',
                'Value is higher than {val}',
                function(val, rule) {
                    return (parseFloat(val) || 0) <= (parseFloat(rule) || 0)
                }
            ],
            'date' : [
                'Wrong date format',
                'Bad date format',
                function(val, rule) {
                    return /^([1-9]|0[1-9]|1[012])[- \/.](0[1-9]|[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/.test(val);
                }
            ],
            'length' : [
                'Must be {val} characters long',
                'Should be {val} characters long',
                function(val, rule) {
                    return val.length == rule
                }
            ],
            'maxLength' : [
                'Must be <= {val} characters long',
                'Should be less than {val} characters long',
                function(val, rule) {
                    return val.length <= rule
                }
            ],
            'minLength' : [
                'Must be >= {val} characters long',
                'Should be more than {val} characters long',
                function(val, rule) {
                    return val.length <= rule
                }
            ],
            'required' : [
                'Required field',
                'This field is highly recommended to fill',
                function(val, rule) {
                    return !(val == '' || val == null || typeof val == undefined)
                }
            ]
        },
        hideError : function(warningObj) {
            addClass(warningObj, defaults.hideClass);
        },
        showError : function(warningObj, text) {
            warningObj.innerHTML = text;
            removeClass(warningObj, defaults.hideClass);
        },
        field : function(form, fieldName, params, value) {
            var fieldValid = !0;
            var valid = !0;

            var config = form.getConfig();
            var errorClass = config['errorClass'] || defaults.classes.error,
                warningClass = config['warningClass'] || defaults.classes.warning;

            if (params[DATA_TYPE_VALIDATE]) for (var type in params[DATA_TYPE_VALIDATE]) {
                if (!validate.methods[type]) continue;

                if (type == 'required' || (value != '' && value !== null && typeof value !== undefined)) {
                    fieldValid = validate.methods[type][VALIDATION_KEY_TEST](
                        value,
                        params[DATA_TYPE_VALIDATE][type]
                    );
                }

                if (!fieldValid) {
                    validate.showError(
                        form.getErrorContainer(fieldName),
                        validate.methods[type][VALIDATION_KEY_ERR].supplant({val : params[DATA_TYPE_VALIDATE][type]})
                    );
                    if (form.container[fieldName].name !== undefined) {
                        addClass(form.container[fieldName], errorClass);
                    }
                    valid = !1;
                    break;
                } else {
                    if (form.notificationContainers[FIELD_TYPE_ERROR][fieldName]) {
                        validate.hideError(
                            form.getErrorContainer(fieldName)
                        );
                    }
                    if (form.container[fieldName].name !== undefined) {
                        removeClass(form.container[fieldName], errorClass);
                    }
                }
            }

            if (params[DATA_TYPE_WARNING]) for (var type in params[DATA_TYPE_WARNING]) {
                if (!validate.methods[type]) continue;

                if (!valid) {
                    if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                        validate.hideError(
                            form.getWarningContainer(fieldName)
                        );
                    }
                    continue;
                }
                if (type == 'required' || (value != '' && value !== null && typeof value !== undefined)) {
                    fieldValid = validate.methods[type][VALIDATION_KEY_TEST](
                        value,
                        params[DATA_TYPE_WARNING][type]
                    );
                }

                if (!fieldValid) {
                    console.log('getWarningContainer', fieldName, form.getWarningContainer(fieldName));

                    validate.showError(
                        form.getWarningContainer(fieldName),
                        validate.methods[type][VALIDATION_KEY_WARN].supplant({ val: params[DATA_TYPE_WARNING][type] })
                    );
                    if (form.container[fieldName].name !== undefined) {
                        addClass(form.container[fieldName], warningClass);
                    }
                    break;
                } else {
                    if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                        validate.hideError(
                            form.getWarningContainer(fieldName)
                        );
                    }
                    if (form.container[fieldName].name !== undefined) {
                        removeClass(form.container[fieldName], warningClass);
                    }
                }
            }
            return valid;
        },
        process : function(form, fields) {
            var container = form.container;

            var data = form.getFormData();
            var valid = !0;

            for (var i in fields) {
                if (container[i] === undefined) continue;
                var name = container[i].name ? container[i].name : container[i][0].name;
                if (validate.field(form, name, fields[i], data[i]) === !1) {
                    valid = !1;
                }
            }
            return valid;
        }
    };
    function differs(a, b) {
        if (typeof a == typeof b && ("string" == typeof b || "number" == typeof b))return a != b;
        if ("object" == typeof a && "object" == typeof b) {
            var c;
            for (c in a)if (differs(a[c], b[c]))return!0;
            for (c in b)if (differs(a[c], b[c]))return!0
        } else if (typeof a != typeof b)return!0;
        return!1
    }
    function error() {
        throw new Error(Array.prototype.slice.call(arguments).join(', '))
    }
    function warning() {
        console.log(Array.prototype.slice.call(arguments).join(', '))
    }
    function setFieldValue(elem, value) {
        if (!elem) return;

        var setValue = function(el, val) {
            var tagName = el.tagName.toLowerCase();

            switch (tagName) {
                case 'select':
                    var options = el.children, found = !1;
                    for (var i = 0; i < options.length; i++) {
                        if (val == options[i].value) {
                            options[i].setAttribute('selected', '1');
                            options[i].selected = !0;
                            found = !0;
                            continue;
                        }

                        options[i].removeAttribute('selected');
                        options[i].selected = !1;
                    }

                    if (!found) {
                        el.selectedIndex = -1
                    }
                    break;
                case 'input':
                    switch (el.type) {
                        case 'radio':
                            if (val == el.value) {
                                el.setAttribute('checked', 'true');
                                el.checked = !0;
                            } else {
                                el.removeAttribute('checked');
                                el.checked = !1;
                            }
                            break;
                        case 'password':
                        case 'hidden':
                        case 'text':
                            if (typeof val == 'object') {
                                el.setAttribute('value', val);
                                el.value = val;
                            } else {
                                el.setAttribute('value', val);
                                el.value = val;
                            }
                            break;
                        case 'checkbox':
                            var isBitmask = el.hasAttribute('bitmask');
                            if ((isBitmask && !!(el.value & val)) || (!!val && val !== '0' && val !== '!1' && !isBitmask)) {
                                el.setAttribute('checked', 'true');
                                el.checked = !0;
                            } else {
                                el.removeAttribute('checked');
                                el.checked = !1;
                            }
                            break;
                    }
                    break;
                case 'textarea':
                    el.innerHTML = val;
                    el.value = val;
                    break;
            }
        };

        /* in case if field name is xxx[] array */
        if (typeof value == 'object' && elem.length) {
            for (var i = 0; i < elem.length; i++) setValue(elem[i], value[i]);
            return;
        }
        if (elem.length && !elem.tagName) {
            for (var i = 0; i < elem.length; i++) setValue(elem[i], value);
            return;
        }

        setValue(elem, value);
    }

    var addClass = function(element, className) {
        if (hasClass(element, className)) return;
        element.className = (element.className + ' ' +className).trim();
    };
    var hasClass = function(element, className) {
        return (new RegExp("( |^)" + className + "( |$)", "g")).test(element.className);
    };
    var removeClass = function(element, className) {
        var reg = new RegExp("( |^)" + className + "( |$)", "g");
        element.className = element.className.replace(reg, function(a,b,c) {
            return b==c ? c : ''
        })
    };

    var fieldValue = {
        allReg : /\[([a-zA-Z0-9-]*)\]/g,
        isObjReg : /\[(.*)\]/g,
        serialize: function (a, b) {
            var c = [];
            for (var d in a) {
                var e = b ? b + "[" + d + "]" : d, f = a[d];
                c.push("object" == typeof f ? fieldValue.serialize(f, e) : encodeURIComponent(e) + "=" + encodeURIComponent(f))
            }
            return c.join("&")
        },
        get : function(fieldName, reference) {
            var arr = [fieldName.replace(fieldValue.isObjReg, '')];
            var match;
            while (match = fieldValue.allReg.exec(fieldName)) {
                arr.push(match[1]);
            }

            if (reference === undefined || reference[arr[0]] === undefined) return undefined;

            var tmpObj = reference;

            for (var i = 0; i < arr.length; i++) {
                if (tmpObj[arr[i]] !== undefined) {
                    if (tmpObj[arr[i]] == '') return tmpObj[arr[i]];
                    tmpObj = tmpObj[arr[i]]
                }
            }

            return tmpObj;
        },
        setVal : function(namesArr, value, ref) {
            if (!namesArr.length) {
                return;
            }
            var name = namesArr.shift();
            var next = namesArr[0];

            var tmpObj = ref;

            if (next === undefined) {
                if (name == '') {
                    if (!ref.push) return false;
                    ref.push(
                        value
                    );
                    return
                }
                ref[name] = value;
                return
            }
            if (name == '') {
                if (!tmpObj.push) tmpObj = [];

                tmpObj.push(
                    next == '' ? [] : {}
                );
                name = tmpObj.length - 1;
            }
            tmpObj = tmpObj[name] = (typeof tmpObj[name] == 'object' && tmpObj[name] !== null) ? tmpObj[name] : (next == '' ? [] : {});
            fieldValue.setVal(namesArr, value, tmpObj)
        },
        set : function(fieldName, value, reference) {
            var freeVar = fieldName.replace(fieldValue.isObjReg, '');
            var arr = [];
            if (freeVar) arr.push(freeVar);

            var match;
            while (match = fieldValue.allReg.exec(fieldName)) {
                arr.push(match[1]);
            }

            fieldValue.setVal(arr, value, reference);
        }
    };

    function formToArray(form, emptyFields) {
        var elements = form.elements;
        var result = {};

        if (!elements) {
            return result;
        }

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var name = element.name;

            var getFieldValue = function (elem) {
                var name = elem.name, type = elem.type, tag = elem.tagName.toLowerCase();

                if (!name || elem.disabled || type == 'reset' || type == 'button' ||
                    (type == 'checkbox' || type == 'radio') && !elem.checked ||
                    (type == 'submit' || type == 'image') && elem.form && elem.form.clk != elem ||
                    tag == 'select' && elem.selectedIndex == -1) {
                    return null;
                }

                switch (tag) {
                    case 'select':
                        var index = elem.selectedIndex;
                        if (index < 0) {
                            return null;
                        }
                        var a = [], ops = elem.options;
                        var one = (type == 'select-one');
                        var max = (one ? index + 1 : ops.length);
                        for (var i = (one ? index : 0); i < max; i++) {
                            var op = ops[i];
                            if (op.selected) {
                                var v = op.value;
                                if (!v) {  /* IE fix */
                                    v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                                }
                                if (one) {
                                    return v;
                                }
                                a.push(v);
                            }
                        }
                        return a;
                    case 'input':
                        switch (type) {
                            case 'radio':
                                return elem.value === '' ? null : elem.value;
                            case 'checkbox':
                                if (!elem.hasAttribute('value')) {
                                    return 1;
                                }
                                return elem.value === '' ? 1 : elem.value;
                            case 'text':
                            case 'password':
                            case 'hidden':
                                return elem.value === '' ? null : elem.value;
                                break;
                        }
                        break;
                    case 'textarea':
                        return elem.value === '' ? null : elem.value;
                }

                return !1
            };

            if (!name || element.disabled || hasClass(element, 'default-text')) {
                continue;
            }

            if (emptyFields && fieldValue.get(name, result) === undefined) {
                fieldValue.set(name, null, result);
            }

            var value = getFieldValue(element);

            if (value === null ||
                !emptyFields && ( value === '' ||
                    value === null ||
                    value === undefined
                    )
                ) continue;

            if (element.hasAttribute('bitmask')) {
                value = parseInt(value, 10) || 0;
                if (value !== 0 || emptyFields) {
                    result[name] |= value;
                }
                continue;
            }

            fieldValue.set(name, value, result);
        }

        return result;
    }
    function setValues(form, data) {
        if (!data) return;

        var fired = {};
        elementsProcess.call(form, function(elem) {
            var elName = elem.name;
            var value = fieldValue.get(elName, data);

            if (value === undefined) return;

            setFieldValue(form.container[elName], value);

            if (fired[elem.name]) return;

            fired[elem.name] = 1;
        });
    }
    function createMsgContainer(name, type, tagName) {
        var obj = document.createElement(tagName.toUpperCase());
        obj.setAttribute('class', 'form_' + type + '_' + name);
        obj.setAttribute('name', name);

        return obj;
    }
    function createTextContainer(className) {
        var span = document.createElement('SPAN');
        span.className = className;

        addClass(span, defaults.hideClass);

        return span;
    }
    function setDefaultValues(form, fieldsList) {
        if (!fieldsList) return;
        for (var name in fieldsList) {
            if (!form.container[name]) {
                warning('field wasn\'t added', name);
            }
            if (fieldsList[name]['defaultVal'] === undefined) {
                continue
            }
            setFieldValue(form.container[name], fieldsList[name]['defaultVal']);
        }
    }
    function bind(obj, evt, fnc) {
        // W3C model
        if (obj.addEventListener) {
            obj.addEventListener(evt, fnc, !1);
            return !0;
        }
        // Microsoft model
        else if (obj.attachEvent) {
            return obj.attachEvent('on' + evt, fnc);
        }
        // Browser don't support W3C or MSFT model, go on with traditional
        else {
            evt = 'on'+evt;
            if(typeof obj[evt] === 'function'){
                // Object already has a function on traditional
                // Let's wrap it with our own function inside another function
                fnc = (function(f1,f2){
                    return function(){
                        f1.apply(this,arguments);
                        f2.apply(this,arguments);
                    }
                })(obj[evt], fnc);
            }
            obj[evt] = fnc;
            return !0;
        }
    }
    function setAtributes(form, fieldsList) {
        if (!fieldsList) return;

        for (var name in fieldsList) {
            for (var paramName in fieldsList[name]) {
                var attrArr = null;

                switch (paramName) {
                    case DATA_TYPE_DISABLED:
                    case DATA_TYPE_BITMASK:
                        if (form.container[name].length) {
                            for (var i = 0; i < form.container[name].length; i++) {
                                form.container[name][i].setAttribute(paramName, '1');
                            }
                        } else {
                            form.container[name].setAttribute(paramName, '1');
                        }
                        break;
                    case DATA_TYPE_ATTRIBUTES:
                        attrArr = fieldsList[name][paramName];
                        for (var attr in attrArr) {
                            form.container[name].setAttribute(attr, attrArr[attr])
                        }
                        break;
                    case DATA_TYPE_CLASS:
                        attrArr = fieldsList[name][paramName];

                        if (typeof attrArr == 'string') {
                            addClass(form.container[name], attrArr);
                        } else {
                            try {
                                for (var i = 0; i < attrArr.length; i++) {
                                    addClass(form.container[name], attrArr[i]);
                                }
                            } catch (e) {}
                        }
                        break;
                }
            }
        }
    }
    function bindFormEvents(form) {
        var conf = form.getConfig();

        if (!(conf[PARAM_FLAGS] & FLAG_ASYNC)) {
            form.submit = function() {
                form.container.submit.call(form.container);
            };
            return;
        }

        var submit = function(callback) {
            var submitCallback = conf[PARAM_SUBMIT_CALLBACK] || defaults.submitCallback,
                validateCallback = conf[PARAM_ON_VALIDATE] || defaults.validateCallback,
                beforeSubmit = conf[PARAM_BEFORE_SUBMIT] || defaults.beforeSubmitCallback,
                afterSubmit = conf[PARAM_AFTER_SUBMIT] || defaults.afterSubmitCallback,
                onSubmit = conf[PARAM_ON_SUBMIT] || function(callback) {
                    callback = callback || function() {};

                    var isValid = form.validate();
                    validateCallback(isValid);
                    if (isValid) {
                        var data = form.getFormData();

                        if (conf[PARAM_PARAMS]) {
                            for (var i in conf[PARAM_PARAMS]) {
                                data[i] = conf[PARAM_PARAMS][i];
                            }
                        }

                        defaults.ajax(form.action, "POST", data, (function(cb) {
                            return function(status, data) {
                                submitCallback(status, data, cb);
                            }
                        })(callback));

                        form.saveChanges();

                        return !0;
                    }

                    return !1;
                };

            beforeSubmit(function() {
                if (onSubmit(callback)) afterSubmit()
            });
        };

        form.container.submit = form.submit = submit;

        bind(form.container, 'submit', function(e) {
            if(e.preventDefault) e.preventDefault();
            submit();
            e.returnValue = !1;
            return !1;
        });
    }
    function fireEvent(obj, evt){
        if (obj === undefined) return;
        var evObj;
        if( document.createEvent ) {
            evObj = document.createEvent('MouseEvents');
            evObj.initEvent( evt, true, false );
            if (obj.length && obj.name == undefined) {
                for (var i = 0; i<obj.length; i++)  obj[i].dispatchEvent( evObj )
                return
            }
            obj.dispatchEvent( evObj );
        } else if( document.createEventObject ) { //IE
            evObj = document.createEventObject();
            if (obj.fireEvent === undefined || typeof obj.fireEvent != 'function') {
                return;
            }
            obj.fireEvent( 'on' + evt, evObj );
        }
    }
    function bindInputEvents(validationType) {
        var onChange = function(e, fieldName, type) {
            switch (type) {
                case Forms.VALIDATION_ON_CHANGE:
                    if (e.type == 'blur') {
                        this.validate(fieldName)
                    }
                    break;
                case Forms.VALIDATION_ON_KEYUP:



                    this.validate(fieldName);
                    break;
            }
            var data = this.getFormData();
            var onChangeCallback = this.getConfig()[PARAM_ON_CHANGE] || defaults.onChange;
            var onFieldChange = this.getConfig()[PARAM_ON_FIELD_CHANGE] || function(a,b) {};

            var savedValue = fieldValue.get(fieldName, this.valuesCache);
            var currentValue = fieldValue.get(fieldName, data);

            var isDifferent = differs(this.defaultFormData, data);

            if (this.isChanged != isDifferent) {
                onChangeCallback(isDifferent, this);
            }
            this.isChanged = isDifferent;

            console.log('isDifferent', this.defaultFormData);

            if (differs(savedValue, currentValue)) {
                onFieldChange(fieldName, currentValue);
                fieldValue.set(fieldName, currentValue, this.valuesCache);
            }
        };

        elementsProcess.call(this, function(elem) {
            if (elem.initialized) {
                return;
            }
            var eventFunc = function(n) {
                return function(e) {
                    onChange.call(this, e, n, validationType)
                }.bind(this)
            }.call(this, elem.name);

            bind(elem, 'blur', eventFunc);
            bind(elem, 'click', eventFunc);
            bind(elem, 'keyup', eventFunc);
            bind(elem, 'formChange', eventFunc);

            elem.initialized = !0;
        }.bind(this));
    }
    function elementsProcess(callback) {
        for (var i = 0; i < tagsArr.length; i++) {
            var elements = this.container.getElementsByTagName(tagsArr[i]);

            for (var elIndex = 0; elIndex < elements.length; elIndex++) {
                callback(elements[elIndex]);
            }
        }
    }
    function findElementByNameAndType(parent, name, type) {
        if (parent.allChildren == undefined) {
            parent.allChildren = {};

            var all = parent.getElementsByTagName('*');

            for (var i = 0; i < all.length; i++) {
                parent.allChildren[all[i].className] = parent.allChildren[all[i].className] || [];
                parent.allChildren[all[i].className].push(all[i]);
            }
        }
        var result = parent.allChildren['form_' + type + '_' + name];

        if (result === undefined) return null;

        if (result.length == 1) return result[0];

        return result[0] ? result : null;
    }
    function insertFields(form, fieldsList, uniqueLabels, debugMode, templates) {
        debugMode = debugMode || !1;
        uniqueLabels = uniqueLabels || !1;
        templates = templates || defaults.templateFast;

        if (!fieldsList) return;

        var container = form.container;

        form.errorContainers = {};
        form.warningContainers = {};
        form.fieldContainers = {};

        function elementToString(elem) {
            var tmp = document.createElement("p");
            tmp.appendChild(elem);
            return tmp.innerHTML;
        }
        function getTagNameByType(type) {
            switch (type) {
                case 'option':
                case 'select':
                case 'textarea':
                    return type;
                case 'text':
                case 'hidden':
                case 'password':
                case 'checkbox':
                case 'radio':
                    return 'input';
                default :
                    return '';
            }
        }

        function createElementByFieldType(type, name) {
            name = name || !1;

            var element = null,
                tagName = getTagNameByType(type),
                elemType = null;

            switch (type) {
                case 'text':
                case 'hidden':
                case 'password':
                case 'checkbox':
                case 'radio':
                    elemType = type;
                    break;
            }

            if (!tagName) return null;

            try {
                /* for IE */
                element = document.createElement('<' + tagName + ' name="' + name + '" type="' + elemType + '">')
            } catch (e) {
                /* normal browser */
                element = document.createElement(tagName.toUpperCase());
            }

            /* just in case */
            if (elemType !== null) {
                element.setAttribute('type', elemType);
                element.type = elemType;
            }
            if (name !== !1) {
                /* just in case */
                element.setAttribute('name', name);
                element.name = name;
            }

            return element;
        }

        var getLabelElement = function(text, forId) {
            var label = document.createElement('LABEL');
            label.innerHTML = text;
            label.setAttribute('for', forId);
            return label
        };

        for (var name in fieldsList) {
            var fieldName = name + '';
            var fieldData = fieldsList[fieldName];
            var fieldType = fieldData[DATA_TYPE_TYPE];

            if (!fieldType) continue;

            form.fieldContainers[fieldName] = findElementByNameAndType(container, fieldName, FIELD_TYPE_CONTAINER);

            if (!form.fieldContainers[fieldName]) continue;

            /* cleaning inner content */
            form.fieldContainers[fieldName].innerHTML = '';

            /* field unique id */
            fieldId = uniqueLabels ? fieldName + '-' + (fieldUniqueCounter++) : fieldName;

            /* inserting a label for a single field */
            var labelContainer = findElementByNameAndType(container, fieldName, FIELD_TYPE_LABEL);

            if (fieldData['label'] && labelContainer) {
                labelContainer.innerHTML = '';

                var label = getLabelElement(fieldData['label'], fieldId);

                if (debugMode) {
                    label.setAttribute('title', fieldName);
                }

                labelContainer.appendChild(label);
            }

            var fieldId;

            var dataArr = {};
            if (fieldData['data']) {
                dataArr = fieldData['data'];
            } else {
                if (fieldData['label']) {
                    dataArr[fieldData['label']] = null;
                } else {
                    dataArr[''] = null;
                }
            }

            form.fieldContainers[fieldName].innerHTML = (function(data, id, type, name, isLabel, templates) {
                /* creating an html to insert into fieldContainer */
                var elementsData = [];

                var elementIndex = 1;

                var length = 0;
                for (var i in data) length++;

                var isMultiple = length >= 2;
                for (var key in data) {
                    var elementId = id + (isMultiple ? '-' + elementIndex : '');
                    var tmpElement, dataToPush = {};

                    if (type == 'select') {
                        if (i != 0) {
                            tmpElement = createElementByFieldType('option');
                            tmpElement.value = '';
                            tmpElement.innerHTML = '';
                            elementsData.push({input : elementToString(tmpElement)});
                            i = 0;
                        }

                        tmpElement = createElementByFieldType('option');
                        tmpElement.innerHTML = key;
                    } else {
                        tmpElement = createElementByFieldType(type, name);
                        tmpElement.setAttribute('id', elementId);
                        dataToPush['label'] = isLabel ? '' : elementToString(getLabelElement(key, elementId));
                    }
                    var valueToSet = data[key] === null ? '' : data[key];

                    if (type != 'textarea') {
                        tmpElement.setAttribute('value', valueToSet);
                        tmpElement.value = valueToSet;
                    }

                    tmpElement.setAttribute('error-id', id);

                    dataToPush['input'] = elementToString(tmpElement);
                    elementsData.push(dataToPush);
                    elementIndex++;
                }

                if (templates[type]) {
                    return templates[type](name, id, elementsData);
                }

                return elementsData[0]['input'];
            })(dataArr, fieldId, fieldType, fieldName, !!labelContainer, templates);
        }
    }

    function getNotificationContainer(type, name) {
        var container = this.notificationContainers[type];
        if (container[name] === void 0) {
            var errorContainer = findElementByNameAndType(this.container, name, type);
            if (!errorContainer) {
                errorContainer = createMsgContainer(name, type, this.fieldContainers[name].tagName);
                this.fieldContainers[name].parentNode.insertBefore(errorContainer, this.fieldContainers[name].nextSibling);
            }
            if (!errorContainer.children.length) {
                errorContainer.appendChild(createTextContainer(this.getConfig()[type + 'Class'] || defaults.classes[type]));
            }

            container[name] = errorContainer;
        }

        return this.notificationContainers[type][name].children[0]
    }

    function clear() {
        elementsProcess.call(this, function(el) {
            this.setField(el.name, '')
        }.bind(this))
    }

    /* IE8 fix */
    (function (d, g) {
        if (window.Element === undefined) return;
        d[g] || (d[g] = function (g) {
            return this.querySelectorAll("." + g)
        }, Element.prototype[g] = d[g])
    })(document, "getElementsByClassName");

    return {
        Form : function(conf) {
            var opt = {
                cache : null,
                config : conf || null,
                initialized : !1,
                defaultFormData : null,
                container : null
            };
            var form = this;

            function getConfig() {
                return opt.config
            }

            function processConfig(c) {
                /* TODO check if incoming object is valid */
                return !!c
            }

            form.init = function(c) {
                if (opt.initialized) {
                    warning(MSG_INITIALIZED);
                    return !1
                }

                if (!processConfig(c)) {
                    error(MSG_NO_CONFIG);
                }

                opt.config = c;

                opt.initialized = !0;
                return !0;
            };

            form.isChanged = !1;

            form.getConfig = getConfig;

            if (!processConfig(opt.config)) {
                warning(MSG_NO_CONFIG);
                return;
            }

            if (opt.config[PARAM_ID]) {
                opt.container = document.getElementById(opt.config[PARAM_ID]);
                if (!opt.container) error(MSG_NO_ELEMENT, opt.config[PARAM_ID]);
                form.container = opt.container;
            }
            if (opt.config[PARAM_OBJ]) {
                form.container = opt.container = opt.config[PARAM_OBJ];
                opt.config[PARAM_ID] = form.container.id;
            }

            form.getFormData = function(emptyFields) {
                emptyFields = emptyFields || !!(opt.config[PARAM_FLAGS] & FLAG_SUBMIT_EMPTY);
                return formToArray(form.container, emptyFields)
            };

            if (opt.config[PARAM_ACTION]) {
                opt.container.setAttribute(PARAM_ACTION, opt.config[PARAM_ACTION])
            }
            form.ignoreList = {};


            form.action = opt.container.getAttribute('action');

            form.setField = function(name, value) {
                setFieldValue(opt.container[name], value);
                fireEvent(opt.container[name], 'formChange');
            };
            form.getField = function(name) {
                return form.container[name];
            };
            form.validate = function(fieldName) {
                if (fieldName) {
                    var data = form.getFormData();
                    return validate.field(form, fieldName, opt.config[PARAM_FIELDS][fieldName], data[fieldName])
                } else {
                    return validate.process(form, opt.config[PARAM_FIELDS])
                }
            };
            form.clear = clear.bind(form);

            form.notificationContainers = {};
            form.notificationContainers[FIELD_TYPE_ERROR] = {};
            form.notificationContainers[FIELD_TYPE_WARNING] = {};

            form.getErrorContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_ERROR, name)
            };

            form.getWarningContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_WARNING, name)
            };

            form.initInputs = function() {
                /* go through all fields in the form. IE7 ".hasAttribute" fix */
                elementsProcess.call(form, function(elem) {
                    if (elem.hasAttribute === undefined) {
                        elem.hasAttribute = function(attrName) {
                            return typeof this[attrName] !== 'undefined';
                        }
                    }
                });

                var index = 0;
                for (var i = 0; i < form.container.elements.length; i++) {
                    var elem = form.container.elements[i];

                    if (elem.type && (elem.type == 'hidden' || elem.type == 'disabled')) {
                        continue;
                    }
                    elem.setAttribute('tabindex', ++index);
                }

                /* bind change events */
                bindInputEvents.call(form, opt.config[PARAM_VALIDATION_TYPE] || Forms.VALIDATION_ON_SUBMIT);
            };
            form.saveChanges = function() {
                /* stores saved changes */
                form.defaultFormData = form.getFormData();
                (opt.config[PARAM_ON_CHANGE] || defaults.onChange)(!1, form);
                form.isChanged = !1;
            };

            /* inserting field into wrappers */
            insertFields(
                form,
                opt.config[PARAM_FIELDS],
                !!(opt.config[PARAM_FLAGS] & FLAG_UNIQUE_LABELS),
                !!(opt.config[PARAM_FLAGS] & FLAG_DEBUG),
                opt.config[PARAM_TEMPLATES]
            );

            form.initInputs();

            /* insert default values */
            setDefaultValues(form, opt.config[PARAM_FIELDS]);

            /* insert classes and other attributes, validation */
            setAtributes(form, opt.config[PARAM_FIELDS]);

            /* insert values from data object */
            if (opt.config[PARAM_DATA]) {
                setValues(form, opt.config[PARAM_DATA]);
            }

            /* stores current changes */
            form.valuesCache = form.getFormData();

            bindFormEvents(form);

            form.saveChanges();

            if (opt.config[PARAM_VALIDATION_TYPE] === VALIDATION_ON_KEYUP) {
                form.validate();
            }

            form.remove = function() {
                Forms.remove(opt.config[PARAM_ID]);
            };

            form.remove();

            formsList[opt.config[PARAM_ID]] = form;
        },
        VALIDATION_ON_SUBMIT : VALIDATION_ON_SUBMIT,
        VALIDATION_ON_CHANGE : VALIDATION_ON_CHANGE,
        VALIDATION_ON_KEYUP  : VALIDATION_ON_KEYUP,
        FLAG_DEBUG : FLAG_DEBUG,
        FLAG_SUBMIT_EMPTY : FLAG_SUBMIT_EMPTY,
        FLAG_UNIQUE_LABELS : FLAG_UNIQUE_LABELS,
        FLAG_ASYNC : FLAG_ASYNC,
        defaults : defaults,
        remove : function(id) {
            if (formsList[id]) delete formsList[id]
        },
        validation : {
            setWarningMessage : validate.setWarningMessage,
            setErrorMessage : validate.setErrorMessage,
            setTestFunction : validate.setTestFunction,
            'set' : validate.set,
            remove : validate.remove
        },
        getList : function() {
            return formsList
        }
    }
})();
