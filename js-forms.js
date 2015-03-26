/*
 * Convenient tool to work with HTML forms in JavaScript "js-forms"
 * Copyright (c) 2014 Tengiz Adamashvili
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
Forms = (function() {
    /* static, for all objects */
    var FLAG_DEBUG = 2,
        FLAG_ASYNC = 8;

    var PARAM_ID = 'id',
        PARAM_OBJ = 'obj',
        PARAM_FLAGS = 'flags',
        PARAM_AJAX_FUNCTION = 'ajax',
        PARAM_ON_SUBMIT = 'onSubmit',
        PARAM_BEFORE_SUBMIT = 'beforeSubmit',
        PARAM_AFTER_SUBMIT = 'afterSubmit',
        PARAM_SUBMIT_CALLBACK = 'submitCallback',
        PARAM_HIDE_CLASS = 'hideClass',
        PARAM_ERROR_CLASS = 'errorClass',
        PARAM_WARNING_CLASS = 'warningClass',
        PARAM_FIELD_CONTEXT = 'fieldContext',
        PARAM_FORM_CONTEXT = 'formContext',
        PARAM_FIELDS = 'fields',
        PARAM_VALIDATION_TYPE = 'validationType',
        PARAM_ON_FIELD_CHANGE = 'onFieldChange',
        PARAM_ON_CHANGE = 'onChange',
        PARAM_ON_INIT = 'onInit',
        PARAM_ON_VALIDATE = 'onValidate', /* passing the validation result and submitCallback */
        PARAM_ON_WARNING = 'onWarning', /* just passing the validation result there */
        PARAM_VALIDATE = 'validate', /* replaces standard form.validate() and passes form, form[PARAM_CURRENT_DATA]. */
        PARAM_VALIDATION_METHODS = 'validation', /* parameter for passing new validation methods */
        PARAM_DATA = 'data',
        PARAM_DEFAULT_DATA = 'defaultData',
        PARAM_CURRENT_DATA = 'currentData',
        PARAM_INITIAL_DATA = 'initialData',
        PARAM_DIFFERS_OBJ = 'differsObj',
        PARAM_CONFIG = 'config',
        PARAM_CONTAINER = 'container',
        PARAM_ELEMENTS = 'elements',
        PARAM_FIELD_CONTAINER = 'fieldContainers',
        PARAM_PARAMS = 'params',
        PARAM_DEFAULTS = 'defaults',
        PARAM_INNER_HTML = 'innerHTML',
        PARAM_INITIALIZED = 'initialized',
        PARAM_PROTOTYPE = 'prototype',
        PARAM_HAS_OWN_PROPERTY = 'hasOwnProperty',
        PARAM_IS_CHANGED = 'isChanged',
        PARAM_LENGTH = 'length',
        PARAM_ACTION = 'action';

    var DATA_TYPE_ATTRIBUTES = 'attributes',
        DATA_TYPE_TYPE = 'type',
        DATA_TYPE_VALIDATE = 'validate',
        DATA_TYPE_DATA = 'data',
        DATA_TYPE_NOT_EMPTY = 'notEmpty',
        DATA_TYPE_DEFAULT_VAL = 'defaultVal',
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
        MSG_NO_ELEMENT = 'No such element on the page';

    var VALIDATION_ON_SUBMIT = 1,
        VALIDATION_ON_CHANGE = 2,
        VALIDATION_ASAP = 3;

    var VALIDATION_KEY_TEST = 2,
        VALIDATION_KEY_ERR = 0,
        VALIDATION_KEY_WARN = 1;

    var globalTabIndex = 0;
    var fieldUniqueCounter = 1;
    var formsList = {};

    var defaultValues = {
        select: null,
        'select-one': null,
        text: '',
        textarea: '',
        radio: null,
        checkbox: null
    };

    var defaultValidationMethods = {
        'multiple': [
            'Must be a multiple of {val}',
            'Should be a multiple of {val}',
            function (val, rule) {
                return val % rule === 0;
            }
        ],
        'email': [
            'Wrong email format',
            'Bad email format',
            function (val, rule) {
                return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
            }
        ],
        'int': [
            'Must be an integer',
            'Should be an integer',
            function (val, rule) {
                return parseInt(val, 10) == val;
            }
        ],
        'float': [
            'Must be a decimal',
            'Should be a decimal',
            function (val, rule) {
                return /^-?\d{0,}([\.|\,]\d{0,})?$/.test(val);
            }
        ],
        'min': [
            'Must be >= {val}',
            'Value is lower than {val}',
            function (val, rule) {
                return (parseFloat(val) || 0) >= (parseFloat(rule) || 0)
            }
        ],
        'max': [
            'Must be <= {val}',
            'Value is higher than {val}',
            function (val, rule) {
                return (parseFloat(val) || 0) <= (parseFloat(rule) || 0)
            }
        ],
        'date': [
            'Wrong date format',
            'Bad date format',
            function (val, rule) {
                return /^([1-9]|0[1-9]|1[012])[- \/.](0[1-9]|[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/.test(val);
            }
        ],
        'length': [
            'Must be {val} characters long',
            'Should be {val} characters long',
            function (val, rule) {
                return val[PARAM_LENGTH] == rule
            }
        ],
        'maxLength': [
            'Must be <= {val} characters long',
            'Should be less than {val} characters long',
            function (val, rule) {
                return val[PARAM_LENGTH] <= rule
            }
        ],
        'minLength': [
            'Must be >= {val} characters long',
            'Should be more than {val} characters long',
            function (val, rule) {
                return val[PARAM_LENGTH] <= rule
            }
        ],
        'required': [
            'Required field',
            'This field should be filled',
            function (val, rule) {
                return !(val == '' || val == null || typeof val == 'undefined')
            }
        ]
    };
    var fieldValue = {
        allReg : /\[([a-zA-Z0-9-]*)\]/g,
        isObjReg : /\[(.*)\]/g,
        getPath: function(fieldName) {
            var freeVar = fieldName.replace(fieldValue.isObjReg, '');
            var arr = [];
            if (freeVar) arr.push(freeVar);

            var match;
            while (match = fieldValue.allReg.exec(fieldName)) {
                arr.push(match[1]);
            }
            return arr;
        },
        serialize: function (a, b) {
            var c = [];
            for (var d in a) {
                var e = b ? b + "[" + d + "]" : d, f = a[d];
                c.push("object" == typeof f && f !== null ? fieldValue.serialize(f, e) : encodeURIComponent(e) + "=" + (f === null ? '' : encodeURIComponent(f)))
            }
            return c.join("&")
        },
        getOrDel: function(fieldName, reference, del) {
            var arr = this.getPath(fieldName);

            if (reference === undefined || reference[arr[0]] === undefined) return undefined;

            var tmpObj = reference, lastTmpObj, lastInd;

            for (var i = 0; i < arr[PARAM_LENGTH]; i++) {
                if (tmpObj[arr[i]] !== undefined) {
                    if (tmpObj[arr[i]] == '') {
                        return del ? delete tmpObj[arr[i]] : tmpObj[arr[i]];
                    }
                    lastTmpObj = tmpObj;
                    lastInd = arr[i];
                    tmpObj = tmpObj[arr[i]]
                }
            }
            return del ? delete lastTmpObj[lastInd] : tmpObj;
        },
        del: function(fieldName, reference) {
            return this.getOrDel(fieldName, reference, !0);
        },
        get : function(fieldName, reference) {
            return this.getOrDel(fieldName, reference);
        },
        setVal: function(namesArr, value, ref, hard) {
            if (!namesArr[PARAM_LENGTH]) {
                return;
            }
            var name = namesArr.shift();
            var next = namesArr[0];

            var tmpObj = ref;

            if (next === undefined) {
                if (name == '') {
                    if (!ref.push) return !1;
                    ref.push(
                        value
                    );
                    return
                }
                if (ref === void 0) return;

                ref[name] = value;
                return
            }
            if (next == '' && hard) {
                ref[name] = value;
                return
            }
            if (name == '') {
                if (!tmpObj.push) tmpObj = [];

                tmpObj.push(
                    next == '' ? [] : {}
                );
                name = tmpObj[PARAM_LENGTH] - 1;
            }
            tmpObj = tmpObj[name] =
                (typeof tmpObj[name] == 'object' && tmpObj[name] !== null) ?
                    tmpObj[name] : (
                        next == '' ? [] : {}
                    );
            fieldValue.setVal(namesArr, value, tmpObj, hard)
        },
        set : function(fieldName, value, reference, hard) {
            var arr = this.getPath(fieldName);
            fieldValue.setVal(arr, value, reference, hard);
        }
    };
    function error() {
        throw new Error(Array[PARAM_PROTOTYPE].slice.call(arguments).join(', '))
    }
    function objEach(o, callback) {
        for (var i in o) {
            if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(o, i)) {
                continue;
            }
            if (callback(i, o[i]) === false) {
                break;
            }
        }
    }
    function warning() {
        console.log(Array[PARAM_PROTOTYPE].slice.call(arguments).join(', '))
    }
    function onChange(e, fieldName, type) {
        /* "this" is a form object */
        var oldValue = fieldValue.get(fieldName, this[PARAM_CURRENT_DATA]);
        var newValue = this.getFieldValue(fieldName);
        var initialValue = fieldValue.get(fieldName, this[PARAM_INITIAL_DATA]);
        var onChangeCallback = this[PARAM_CONFIG][PARAM_ON_CHANGE] || this[PARAM_DEFAULTS][PARAM_ON_CHANGE];
        var onFieldChange = this[PARAM_CONFIG][PARAM_ON_FIELD_CHANGE] || false;

        if (differs(oldValue, newValue, !0)) {
            fieldValue.set(fieldName, newValue, this[PARAM_CURRENT_DATA], 1);

            switch (type) {
                case VALIDATION_ON_CHANGE:
                case VALIDATION_ASAP:
                    this[PARAM_VALIDATE](fieldName);
                    break;
                case VALIDATION_ON_SUBMIT:
                    break;
            }

            if (onFieldChange) onFieldChange(fieldName, newValue, this);
        }

        var beforeChange = differs(this[PARAM_DIFFERS_OBJ], {});

        if (differs(initialValue, newValue, !0)) {
            fieldValue.set(fieldName, !0, this[PARAM_DIFFERS_OBJ]);
        } else {
            fieldValue.del(fieldName, this[PARAM_DIFFERS_OBJ]);
        }

        var afterChange = differs(this[PARAM_DIFFERS_OBJ], {});

        if (beforeChange != afterChange) {
            this[PARAM_IS_CHANGED] = afterChange;
            onChangeCallback(afterChange, this);
        }
    }
    function processElement(form, elem) {
        var name = elem.name;
        var validationType = form[PARAM_CONFIG][PARAM_VALIDATION_TYPE];

        /* selects here too */
        if (elem.hasAttribute === undefined) {
            elem.hasAttribute = function (attrName) {
                return typeof this[attrName] !== 'undefined';
            }
        }

        (function() {
            if (elem.type && (elem.type == 'hidden' || elem.type == 'disabled')) {
                return;
            }

            elem.setAttribute('tabindex', ++globalTabIndex);
            elem.formIndex = elem.formIndex || globalTabIndex;
        })();

        if (form[PARAM_CONFIG][PARAM_FIELDS][name]) {
            /* insert classes and other attributes, validation */
            objEach(form[PARAM_CONFIG][PARAM_FIELDS][name], function(paramName, valName) {
                var attrArr = null;

                switch (paramName) {
                    case DATA_TYPE_DISABLED:
                    case DATA_TYPE_BITMASK:
                        if (elem[PARAM_LENGTH]) {
                            for (var i = 0, subElem; subElem = elem[i]; i++) {
                                subElem.setAttribute(paramName, '1');
                            }
                        } else {
                            elem.setAttribute(paramName, '1');
                        }
                        break;
                    case DATA_TYPE_ATTRIBUTES:
                        attrArr = valName;
                        objEach(attrArr, function(attr, attrArrAttr) {
                            elem.setAttribute(attr, attrArrAttr)
                        });
                        break;
                    case DATA_TYPE_CLASS:
                        attrArr = valName;

                        if (typeof attrArr == 'string') {
                            addClass(elem, attrArr);
                        } else {
                            try {
                                for (var i = 0; i < attrArr[PARAM_LENGTH]; i++) {
                                    addClass(elem, attrArr[i]);
                                }
                            } catch (e) {}
                        }
                        break;
                }
            });
        }

        if (!elem[PARAM_INITIALIZED]) {
            var eventFunc = function (n) {
                return function (e) {
                    onChange.call(this, e, n, validationType)
                }.bind(this)
            }.call(form, elem.name);

            bind(elem, 'blur', eventFunc);
            bind(elem, 'click', eventFunc);
            bind(elem, 'keyup', eventFunc);
            bind(elem, 'contextmenu', function(e) {
                form[PARAM_DEFAULTS][PARAM_FIELD_CONTEXT](e, elem, form)
            });

            elem[PARAM_INITIALIZED] = !0;
        }
    }


    function bindFormEvents(form) {
        if (!(form[PARAM_CONFIG][PARAM_FLAGS] & FLAG_ASYNC)) {
            /* if not async */
            form.submit = function (callback) {
                form[PARAM_CONTAINER].submit(callback);
            };
            return;
        }

        var submit = function () {
            var lastOne = arguments[arguments[PARAM_LENGTH] - 1];
            var callback = typeof lastOne == 'function' ? lastOne : function() {};

            var submitCallback = form[PARAM_CONFIG][PARAM_SUBMIT_CALLBACK] || form[PARAM_DEFAULTS][PARAM_SUBMIT_CALLBACK],
                validateCallback = form[PARAM_CONFIG][PARAM_ON_VALIDATE] || form[PARAM_DEFAULTS][PARAM_ON_VALIDATE],
                beforeSubmit = form[PARAM_CONFIG][PARAM_BEFORE_SUBMIT] || form[PARAM_DEFAULTS][PARAM_BEFORE_SUBMIT],
                afterSubmit = form[PARAM_CONFIG][PARAM_AFTER_SUBMIT] || form[PARAM_DEFAULTS][PARAM_AFTER_SUBMIT],
                onSubmit = form[PARAM_CONFIG][PARAM_ON_SUBMIT] || function (cb) {
                    cb = cb || function() {};

                    /* adding params */
                    if (form[PARAM_CONFIG][PARAM_PARAMS]) {
                        objEach(form[PARAM_CONFIG][PARAM_PARAMS], function(i, paramI) {
                            fieldValue.set(i, paramI, form[PARAM_CURRENT_DATA]);
                        });
                    }

                    form[PARAM_DEFAULTS][PARAM_AJAX_FUNCTION](form.action, "POST", form[PARAM_CURRENT_DATA], (function (cb) {
                        return function (status, data) {
                            if (status) {
                                form.saveChanges();
                            }
                            submitCallback.call(form, status, data, cb);
                        }
                    })(cb));
                };

            beforeSubmit(function () {
                var allValues = form.getAllValues();

                form[PARAM_CURRENT_DATA] = allValues;

                var validationResult = form[PARAM_VALIDATE]();

                validateCallback(validationResult, function() {
                    onSubmit(callback);
                    afterSubmit()
                });
            });
        };

        form[PARAM_CONTAINER].submit = form.submit = submit;

        bind(form[PARAM_CONTAINER], 'submit', function (e) {
            if (e.preventDefault) e.preventDefault();
            submit();
            e.returnValue = !1;
            return !1;
        });
        bind(form[PARAM_CONTAINER], 'contextmenu', function(e) {
            form[PARAM_DEFAULTS][PARAM_FORM_CONTEXT](e, form)
        });
    }
    function generateElement(type, name, id, elements) {
        var str = '';

        switch (type) {
            case 'select':
                str = '<select name="' + name + '" id="' + id + '">';

                for (var i = 0, el; el = elements[i]; i++) {
                    str += el['input']
                }

                str += '</select>';
                break;
            case 'radio':
            case 'checkbox':
                str = '<table cellpadding="0" cellspacing="0" class="forms-' + type + '-table">';

                for (var i = 0, el; el = elements[i]; i++) {
                    str += '' +
                        '<tr>' +
                        '<td class="forms-' + type + '">' +
                            el['input'] +
                        '</td>' +
                        '<td class="forms-label-' + type + '">' +
                            el['label'] +
                        '</td>' +
                        '</tr>'
                }

                str += '</table>';
                break;
            default :
                return false
        }

        return str;
    }
    function getElementValue(elem) {
        var name = elem.name, type = elem.type, tag = elem.tagName.toLowerCase();

        if (!name || elem.disabled || type == 'reset' || type == 'button' ||
            type == 'radio' && !elem.checked ||
            (type == 'submit' || type == 'image') && elem.form && elem.form.clk != elem ||
            tag == 'select' && elem.selectedIndex == -1) {
            return null;
        }

        switch (tag) {
            case 'select':
                var index = elem.selectedIndex;
                if (index < 0) {
                    return defaultValues.select;
                }
                var a = [], ops = elem.options;
                var one = (type == 'select-one');
                var max = (one ? index + 1 : ops[PARAM_LENGTH]);
                for (var i = (one ? index : 0); i < max; i++) {
                    var op = ops[i];
                    if (op.selected) {
                        var v = op.value;
                        if (v === undefined) {  /* IE fix */
                            v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                        }
                        if (one) {
                            return v === undefined || v === '' || v === null ? defaultValues.select : v;
                        }
                        a.push(v);
                    }
                }
                return a.join(',');
            case 'input':
                switch (type) {
                    case 'radio':
                        return elem.value === '' ? defaultValues.radio : elem.value;
                    case 'checkbox':
                        /* TODO test in IE */
                        return !!elem.checked ? (elem.value || '1') : defaultValues.checkbox /* TODO I think should be null */;
                        break;
                    case 'text':
                    case 'password':
                    case 'hidden':
                        return elem.value;
                        break;
                }
                break;
            case 'textarea':
                return elem.value;
            default:
                return null
        }
    }
    /* works */
    function formToArray(formContainer) {
        var result = {};

        if (!formContainer[PARAM_LENGTH]) {
            return result;
        }

        for (var i = 0, element; element = formContainer[i]; i++) {
            var name = element.name;

            if (!name || element.disabled || hasClass(element, 'default-text')) {
                continue;
            }

            var value = getElementValue(element);
            var existing = fieldValue.get(name, result);

            /* если значение еще не существует, и значение элемента null */
            if (existing === undefined && value === null) {
                fieldValue.set(name, null, result);
            }

            if (value === null) continue;

            if (element.hasAttribute('bitmask')) {
                value = parseInt(value, 10) || 0;
                value |= parseInt(existing, 10) || 0;
            }

            fieldValue.set(name, value, result);
        }

        return result;
    }
    /* works very well */
    function setFieldValue(elem, value) {
        if (!elem) return false;

        var setValue = function(el, val) {
            switch (el.tagName.toLowerCase()) {
                case 'select':
                    var options = el.children, found = false;
                    for (var i = 0, opts; opts = options[i]; i++) {
                        if (val == opts.value) {
                            opts.setAttribute('selected', '1');
                            opts.selected = !0;
                            found = i;
                            continue;
                        }

                        opts.removeAttribute('selected');
                        opts.selected = !1;
                    }
                    if (found === false) {
                        el.selectedIndex = -1;
                        return !1;
                    }
                    el.selectedIndex = found;
                    return !0;
                case 'input':
                    switch (el.type) {
                        case 'radio':
                            if (val == el.value) {
                                el.setAttribute('checked', 'true');
                                el.checked = !0;
                                return !0;
                            }
                            el.removeAttribute('checked');
                            el.checked = !1;
                            return !1;
                        case 'password':
                        case 'hidden':
                        case 'text':
                            el.setAttribute('value', (val === null ? '' : val));
                            el.value = val === null ? '' : val;
                            return !0;
                        case 'checkbox':
                            var isBitmask = el.hasAttribute('bitmask');
                            if ((isBitmask && !!(el.value & val)) || (!!val && val !== '0' && val !== '!1' && !isBitmask)) {
                                el.setAttribute('checked', 'true');
                                el.checked = !0;
                            } else {
                                el.removeAttribute('checked');
                                el.checked = !1;
                            }
                            return !0;
                    }
                    break;
                case 'textarea':
                    el[PARAM_INNER_HTML] = val;
                    el.value = val;
                    return !0;
            }
        };
        var result = !1;

        /* TODO test more. In case if field name is xxx[] array */
        if (typeof value == 'object' && elem[PARAM_LENGTH] && value !== null) {
            for (var i = 0, el; el = elem[i]; i++) {
                if (setValue(el, value)) {
                    result = !0;
                }
            }
            return result;
        }

        /* if array of elements, like bitmask, where elements have same name, but not select */
        if (elem[PARAM_LENGTH] && !elem.tagName) {
            for (var i = 0, el; el = elem[i]; i++) {
                if (setValue(el, value)) {
                    result = !0;
                }
            }
            return result;
        }

        return setValue(elem, value);
    }
    function isArray(a) {
        return Object[PARAM_PROTOTYPE].toString.call(a) === '[object Array]'
    }
    function setFieldValueByName(form, name, value) {
        if (!form[PARAM_ELEMENTS][name]) return;

        var setResult = setFieldValue(form[PARAM_ELEMENTS][name], value);

        var elem = isArray(form[PARAM_ELEMENTS][name]) ? form[PARAM_ELEMENTS][name][0] : form[PARAM_ELEMENTS][name];

        if (!setResult) {
            value = defaultValues[(elem.type || elem.tagName).toLowerCase()];
        }

        if (!isElementDisabled(elem)) {
            fieldValue.set(name, value, form[PARAM_CURRENT_DATA]);
        }
    }
    function getFieldValueByName(form, name) {
        if (!form[PARAM_ELEMENTS][name]) return void 0;
        return fieldValue.get(name, formToArray(Array[PARAM_PROTOTYPE].concat(form[PARAM_ELEMENTS][name])))
    }
    function getStandartValidationMethod(method) {
        if (!defaultValidationMethods[method]) {
            return false
        }
        return defaultValidationMethods[method];
    }
    function addClass(element, className) {
        if (hasClass(element, className)) return;
        element.className = (element.className + ' ' + className).trim();
    }
    function hasClass(element, className) {
        return (new RegExp("( |^)" + className + "( |$)", "g")).test(element.className);
    }
    function removeClass(element, className) {
        var reg = new RegExp("( |^)" + className + "( |$)", "g");
        element.className = element.className.replace(reg, function (a, b, c) {
            return b == c ? c : ''
        })
    }
    function isElementDisabled(elem) {
        return !!((elem.type && elem.type == 'disabled') || elem.disabled || elem.getAttribute('disabled'))
    }
    function isElementHidden(elem) {
        return !!((elem.type && elem.type == 'hidden'))
    }
    function createMsgContainer(name, type, tagName) {
        var obj = document.createElement(tagName.toUpperCase());
        obj.setAttribute('class', 'form_' + type + '_' + name);
        obj.setAttribute('name', name);

        return obj;
    }
    function createTextContainer(className, hideClassName) {
        var span = document.createElement('SPAN');
        span.className = className;

        addClass(span, hideClassName);

        return span;
    }
    function getNotificationContainer(type, name, classname) {
        var container = this.notificationContainers[type];
        if (container[name] === void 0) {
            var errorContainer = findElementByNameAndType(this[PARAM_CONTAINER], name, type);
            if (!errorContainer) {
                if (!this[PARAM_FIELD_CONTAINER][name]) return;

                errorContainer = createMsgContainer(name, type, this[PARAM_FIELD_CONTAINER][name].tagName);
                this[PARAM_FIELD_CONTAINER][name].parentNode.insertBefore(errorContainer, this[PARAM_FIELD_CONTAINER][name].nextSibling);
            }
            if (!errorContainer.children[PARAM_LENGTH]) {
                errorContainer.appendChild(createTextContainer(classname, this.options[PARAM_DEFAULTS][PARAM_HIDE_CLASS]));
            }

            container[name] = errorContainer;
        }

        return this.notificationContainers[type][name].children[0]
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
            evt = 'on' + evt;
            if (typeof obj[evt] === 'function') {
                // Object already has a function on traditional
                // Let's wrap it with our own function inside another function
                fnc = (function (f1, f2) {
                    return function () {
                        f1.apply(this, arguments);
                        f2.apply(this, arguments);
                    }
                })(obj[evt], fnc);
            }
            obj[evt] = fnc;
            return !0;
        }
    }
    function findElementByNameAndType(parent, name, type) {
        var result;
        if (!parent.allChildren) {
            parent.allChildren = {};

            var all = parent.getElementsByTagName('*');

            for (var i = 0, elem; elem = all[i]; i++) {
                parent.allChildren[elem.className] = parent.allChildren[elem.className] || [];
                parent.allChildren[elem.className].push(elem);
            }
        }
        result = parent.allChildren['form_' + type + '_' + name];

        if (!result) return null;
        if (result && result[PARAM_LENGTH] === void 0) return result;
        if (result[PARAM_LENGTH] == 1) return result[0];

        return result[0] ? result : null;
    }
    function setFormData(form, initialData, fireFieldChangeCallback) {
        fireFieldChangeCallback = fireFieldChangeCallback || false;

        objEach(form[PARAM_ELEMENTS], function(name, elem) {
            /* elem here can be an array of elements */

            var setData = function(elem, elemSample) {
                var fieldsArr = form[PARAM_CONFIG][PARAM_FIELDS];
                var inputValue = fieldValue.get(name, initialData);
                var notEmpty = fieldsArr[name] ? !!fieldsArr[name][DATA_TYPE_NOT_EMPTY] : false;
                var defaultValue = defaultValues[(elemSample.type || elemSample.tagName).toLowerCase()];
                var isDefaultFieldVal = false;
                var valueCame = inputValue !== undefined;

                if (inputValue === undefined) {
                    /* if initialData didn't come, значит одно из двух: */
                    isDefaultFieldVal = true;
                    /* иначе остается значение по-умолчанию */
                    inputValue = defaultValue;

                    if (fieldsArr[name]) {
                        /* если есть в конфиге */

                        if (fieldsArr[name][DATA_TYPE_DEFAULT_VAL] !== undefined) {
                            /* если есть значение по-умолчанию */
                            inputValue = fieldsArr[name][DATA_TYPE_DEFAULT_VAL];
                            isDefaultFieldVal = false;
                        } else if (fieldsArr[name][DATA_TYPE_DATA] && notEmpty) {
                            /* если есть data и значение не должно быть пустым */

                            objEach(fieldsArr[name][DATA_TYPE_DATA], function(i, val) {
                                inputValue = val;
                                isDefaultFieldVal = false;
                                return false
                            });
                        }
                    }
                }
                if (isDefaultFieldVal && isElementDisabled(elemSample)) {
                    /* if it's a disabled element we don't need to set it to PARAM_CURRENT_DATA */
                    /* however we will set the field value if it's not default (null) */
                    return;
                }
                /* if input was already in the form and has defaultValue then we have the value in PARAM_CURRENT_DATA and no need to set it */
                if (!valueCame) {
                    var existingValue = fieldValue.get(name, form[PARAM_CURRENT_DATA]);
                    if (existingValue !== undefined && existingValue != defaultValue) {
                        return;
                    }
                }

                /* setting the value in the field */
                var setResult = setFieldValue(elem, inputValue);

                if (!setResult) {
                    /* если не удалось установить такое значение, значит опять по-умолчанию */
                    inputValue = defaultValue;
                }

                if (!isElementDisabled(elemSample)) {
                    if (fireFieldChangeCallback) {
                        onChange.call(form, null, name, form[PARAM_CONFIG][PARAM_VALIDATION_TYPE]);
                    }

                    if (!valueCame || inputValue === defaultValue) {
                        fieldValue.set(name, inputValue, form[PARAM_DEFAULT_DATA]);
                    }
                    fieldValue.set(name, inputValue, form[PARAM_CURRENT_DATA]);
                }
            };

            if (isArray(elem)) {
                for (var i = 0, el; el = elem[i]; i++) {
                    processElement(form, el);
                }
                setData(elem, elem[0]);
            } else {
                processElement(form, elem);
                setData(elem, elem);
            }
        });
    }
    function insertFields(form, fieldsList, debugMode) {
        debugMode = debugMode || !1;

        if (!fieldsList) return;

        var container = form[PARAM_CONTAINER];

        form[PARAM_FIELD_CONTAINER] = {};

        var getLabelElement = function (text, forId) {
            var label = document.createElement('LABEL');
            label[PARAM_INNER_HTML] = text;
            label.setAttribute('for', forId);
            return label
        };

        objEach(fieldsList, function(fieldName, fieldData) {
            var fieldType = fieldData[DATA_TYPE_TYPE];

            if (!fieldType) return;

            form[PARAM_FIELD_CONTAINER][fieldName] = findElementByNameAndType(container, fieldName, FIELD_TYPE_CONTAINER);

            if (!form[PARAM_FIELD_CONTAINER][fieldName]) return;

            /* cleaning inner content */
            form[PARAM_FIELD_CONTAINER][fieldName][PARAM_INNER_HTML] = '';

            /* field unique id */
            fieldId = fieldName + '-' + (fieldUniqueCounter++);

            /* inserting a label for a single field */
            var labelContainer = findElementByNameAndType(container, fieldName, FIELD_TYPE_LABEL);

            if (fieldData['label'] && labelContainer) {
                labelContainer[PARAM_INNER_HTML] = '';

                var label = getLabelElement(fieldData['label'], fieldId);

                if (debugMode) {
                    label.setAttribute('title', fieldName);
                }

                labelContainer.appendChild(label);
            }

            var fieldId;

            /* TODO не вылядит хорошо, переписать */
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

            form[PARAM_FIELD_CONTAINER][fieldName][PARAM_INNER_HTML] = (function (data, id, type, name, isLabel) {
                /* creating an html to insert into fieldContainer */
                var elementsData = [];

                var elementIndex = 1;

                var length = 0;
                objEach(data, function() {
                    length++
                });

                var isMultiple = length >= 2;

                objEach(data, function(key, dataKey) {
                    var elementId = id + (isMultiple ? '-' + elementIndex : '');
                    var tmpElement, dataToPush = {};

                    var valueToSet = dataKey === null ? '' : dataKey;

                    if (type == 'select') {
                        tmpElement = '<option value="' + valueToSet + '">' + key + '</option>';
                    } else {
                        if (type == 'text' || type == 'hidden' || type == 'password' || type == 'checkbox' || type == 'radio') {
                            tmpElement = '<input type="' + type + '" name="' + name + '" id="' + elementId + '" error-id="' + id + '" value="' + valueToSet + '" />';
                        } else {
                            tmpElement = '<textarea name="' + name + '" id="' + elementId + '" error-id="' + id + '" >' + valueToSet + '</textarea>';
                        }
                        dataToPush['label'] = isLabel ? '' : '<label for="' + elementId + '">' + key + '</label>';
                    }

                    dataToPush['input'] = tmpElement;

                    elementsData.push(dataToPush);
                    elementIndex++;
                });

                /* what's faster to generate text element and then acces it to bind stuff? or create element here, bind everything and append to the wrapper? */
                var str = generateElement(type, name, id, elementsData);

                return str ? str : elementsData[0]['input'];

            })(dataArr, fieldId, fieldType, fieldName, !!labelContainer);
        });
    }

    /* IE8 fix */
    (function (d, g) {
        if (window.Element === undefined) return;
        d[g] || (d[g] = function (g) {
            return this.querySelectorAll("." + g)
        }, Element[PARAM_PROTOTYPE][g] = d[g])
    })(document, "getElementsByClassName");

    function FormFactoryConstructor(def) {
        /* private static for every object of this factory */
        var defaults = {};

        defaults[PARAM_FLAGS] = def[PARAM_FLAGS] || 0;
        defaults[PARAM_VALIDATION_TYPE] = def[PARAM_VALIDATION_TYPE] || Forms.VALIDATION_ON_SUBMIT;

        defaults[PARAM_HIDE_CLASS] = def[PARAM_HIDE_CLASS] || 'h';
        defaults[PARAM_ERROR_CLASS] = def[PARAM_ERROR_CLASS] || 'error';
        defaults[PARAM_AJAX_FUNCTION] = def[PARAM_AJAX_FUNCTION] || function (url, method, data, successCallback, errorCallback) {
            var request = new XMLHttpRequest();
            errorCallback = errorCallback || function () {};

            request.open(method, url);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.send(fieldValue.serialize(data, null));

            request.onreadystatechange = function () {
                if (request.status == 200 && request.readyState == 4) {
                    successCallback(!0, request.response);
                }
                if (request.status != 200) {
                    errorCallback()
                }
            };
        };
        defaults[PARAM_ON_CHANGE] = def[PARAM_ON_CHANGE] || function (a, b) {};
        defaults[PARAM_FORM_CONTEXT] = def[PARAM_FORM_CONTEXT] || function (a) {};
        defaults[PARAM_FIELD_CONTEXT] = def[PARAM_FIELD_CONTEXT] || function () {};
        defaults[PARAM_WARNING_CLASS] = def[PARAM_WARNING_CLASS] || 'warning';
        defaults[PARAM_ON_VALIDATE] = def[PARAM_ON_VALIDATE] || function (a, b) {
            var isValid = !0;

            objEach(a, function(i, ai) {
                if (ai != true) {
                    isValid = !1
                }
            });

            if (isValid) {
                b();
            }
        };
        defaults[PARAM_ON_WARNING] = def[PARAM_ON_WARNING] || function (a) {
            return !0;
        };
        defaults[PARAM_AFTER_SUBMIT] = def[PARAM_AFTER_SUBMIT] || function () {
            return !0;
        };
        defaults[PARAM_BEFORE_SUBMIT] = def[PARAM_BEFORE_SUBMIT] || function (c) {
            c();
            return !0;
        };
        defaults[PARAM_SUBMIT_CALLBACK] = def[PARAM_SUBMIT_CALLBACK] || function (a, b, c) {
            c();
            return !0;
        };

        var validate = {
            methods: {},
            hideError: function (warningObj) {
                if (!warningObj) return;
                addClass(warningObj, defaults[PARAM_HIDE_CLASS]);
            },
            showError: function (warningObj, text) {
                if (!warningObj) return;
                warningObj[PARAM_INNER_HTML] = text;
                removeClass(warningObj, defaults[PARAM_HIDE_CLASS]);
            },
            field: function (form, fieldName, params, value, errorClass, warningClass) {
                var fieldValid = !0;
                var valid = !0;

                if (!params) {
                    return valid;
                }
                if (params[DATA_TYPE_VALIDATE]) {
                    if (form.notificationContainers[FIELD_TYPE_ERROR][fieldName]) {
                        validate.hideError(
                            form.getErrorContainer(fieldName)
                        );
                    }
                    if (form[PARAM_ELEMENTS][fieldName] && form[PARAM_ELEMENTS][fieldName].name !== undefined) {
                        removeClass(form[PARAM_ELEMENTS][fieldName], errorClass);
                    }

                    objEach(params[DATA_TYPE_VALIDATE], function(type, val) {
                        /* custom methods overwrite standard onse */
                        var validationMethod = validate.methods[type] || getStandartValidationMethod(type);

                        if (!validationMethod) return;

                        if (type == 'required' || (value != '' && value !== null && typeof value != 'undefined')) {
                            fieldValid = validationMethod[VALIDATION_KEY_TEST](
                                value,
                                val
                            );
                        }

                        if (!fieldValid) {
                            validate.showError(
                                form.getErrorContainer(fieldName),
                                validationMethod[VALIDATION_KEY_ERR].supplant({val: val})
                            );
                            if (form[PARAM_ELEMENTS][fieldName] && form[PARAM_ELEMENTS][fieldName].name !== undefined) {
                                addClass(form[PARAM_ELEMENTS][fieldName], errorClass);
                            }
                            valid = !1;
                            return false;
                        }
                    });
                }

                if (params[DATA_TYPE_WARNING]) {
                    if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                        validate.hideError(
                            form.getWarningContainer(fieldName)
                        );
                    }
                    if (form[PARAM_ELEMENTS][fieldName] && form[PARAM_ELEMENTS][fieldName].name !== undefined) {
                        removeClass(form[PARAM_ELEMENTS][fieldName], warningClass);
                    }

                    objEach(params[DATA_TYPE_WARNING], function(type, val) {
                        var validationMethod = validate.methods[type] || getStandartValidationMethod(type);

                        if (!validationMethod) return;

                        if (!valid) {
                            if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                                validate.hideError(
                                    form.getWarningContainer(fieldName)
                                );
                            }
                            return;
                        }
                        if (type == 'required' || (value != '' && value !== null && typeof value != 'undefined')) {
                            fieldValid = validationMethod[VALIDATION_KEY_TEST](
                                value,
                                val
                            );
                        }

                        if (!fieldValid) {
                            validate.showError(
                                form.getWarningContainer(fieldName),
                                validationMethod[VALIDATION_KEY_WARN].supplant({ val: val })
                            );
                            if (form[PARAM_ELEMENTS][fieldName] && form[PARAM_ELEMENTS][fieldName].name !== undefined) {
                                addClass(form[PARAM_ELEMENTS][fieldName], warningClass);
                            }
                            valid = 'warning';
                            return false;
                        }
                    });
                }
                return valid;
            },
            reset: function(form) {
                var fields = form[PARAM_CONFIG][PARAM_FIELDS];

                objEach(fields, function(i, fieldsI) {
                    if (fieldsI[DATA_TYPE_VALIDATE]) {
                        if (form.notificationContainers[FIELD_TYPE_ERROR][i]) {
                            validate.hideError(
                                form.getErrorContainer(i)
                            );
                        }
                        if (form[PARAM_ELEMENTS][i] && form[PARAM_ELEMENTS][i].name !== undefined) {
                            removeClass(form[PARAM_ELEMENTS][i], defaults[PARAM_ERROR_CLASS]);
                        }
                    }
                    if (fieldsI[DATA_TYPE_WARNING]) {
                        if (form.notificationContainers[FIELD_TYPE_WARNING][i]) {
                            validate.hideError(
                                form.getWarningContainer(i)
                            );
                        }
                        if (form[PARAM_ELEMENTS][i] && form[PARAM_ELEMENTS][i].name !== undefined) {
                            removeClass(form[PARAM_ELEMENTS][i], defaults[PARAM_WARNING_CLASS]);
                        }
                    }
                });
            },
            process: function (form) {
                var valid = {};

                var fields = form[PARAM_CONFIG][PARAM_FIELDS];

                objEach(fields, function(i, fieldsI) {
                    if (!fieldsI[DATA_TYPE_VALIDATE] && !fieldsI[DATA_TYPE_WARNING]) {
                        return;
                    }
                    valid[i] = validate.field(form, i, fieldsI, fieldValue.get(i, form[PARAM_CURRENT_DATA]), defaults[PARAM_ERROR_CLASS], defaults[PARAM_WARNING_CLASS])
                });

                return valid;
            }
        };

        /* adding custom validations for all objects of current factory */
        if (def[PARAM_VALIDATION_METHODS]) {
            objEach(def[PARAM_VALIDATION_METHODS], function(method, val) {
                validate.methods[method] = val;
            });
        }

        function Form(conf) {
            var opt = {},
                form = this;

            opt[PARAM_INITIALIZED] = !1;
            opt[PARAM_DEFAULTS] = defaults;
            opt[PARAM_CONTAINER] = null;

            opt[PARAM_CONFIG] = conf || null;
            opt[PARAM_CONFIG][PARAM_FIELDS] = opt[PARAM_CONFIG][PARAM_FIELDS] || {};

            function processConfig(c) {
                /* TODO check if incoming object is valid */
                return !!c
            }

            form.init = function (c) {
                if (opt[PARAM_INITIALIZED]) {
                    warning(MSG_INITIALIZED);
                    return !1
                }

                if (!processConfig(c)) {
                    error(MSG_NO_CONFIG);
                }

                opt[PARAM_CONFIG] = c;

                opt[PARAM_INITIALIZED] = !0;
                return !0;
            };

            form[PARAM_IS_CHANGED] = !1;
            form[PARAM_DEFAULT_DATA] = {}; /* default values. after inserting fields, initializing and setting default values, before insertin "data" */
            form[PARAM_CURRENT_DATA] = {}; /* always current data from all the fields */
            form[PARAM_INITIAL_DATA] = {}; /* cloned formData after the initialization. Every save clones it again */
            form[PARAM_DIFFERS_OBJ] = {}; /* mark here fieldNames which have changed (if differs current value and saved value) */
            form[PARAM_CONFIG] = opt[PARAM_CONFIG];
            form.options = opt;
            form[PARAM_DEFAULTS] = defaults;

            if (!processConfig(opt[PARAM_CONFIG])) {
                warning(MSG_NO_CONFIG);
                return;
            }

            if (opt[PARAM_CONFIG][PARAM_ID]) {
                opt[PARAM_CONTAINER] = document.getElementById(opt[PARAM_CONFIG][PARAM_ID]);
                if (!opt[PARAM_CONTAINER]) error(MSG_NO_ELEMENT, opt[PARAM_CONFIG][PARAM_ID]);
                form[PARAM_CONTAINER] = opt[PARAM_CONTAINER];
            }
            if (opt[PARAM_CONFIG][PARAM_OBJ]) {
                form[PARAM_CONTAINER] = opt[PARAM_CONTAINER] = opt[PARAM_CONFIG][PARAM_OBJ];
                opt[PARAM_CONFIG][PARAM_ID] = form[PARAM_CONTAINER].getAttribute('id');
            }

            if (!form[PARAM_CONTAINER]) {
                warning(MSG_NO_ELEMENT);
                return;
            }

            opt[PARAM_CONFIG][PARAM_FLAGS] = opt[PARAM_CONFIG][PARAM_FLAGS] ? (opt[PARAM_CONFIG][PARAM_FLAGS] | defaults[PARAM_FLAGS]) : defaults[PARAM_FLAGS];

            if (!opt[PARAM_CONFIG][PARAM_VALIDATION_TYPE]) {
                opt[PARAM_CONFIG][PARAM_VALIDATION_TYPE] = defaults[PARAM_VALIDATION_TYPE];
            }

            form.getFormData = function () {
                return form[PARAM_CURRENT_DATA];
            };

            if (opt[PARAM_CONFIG][PARAM_ACTION]) {
                opt[PARAM_CONTAINER].setAttribute(PARAM_ACTION, opt[PARAM_CONFIG][PARAM_ACTION])
            }

            form.action = opt[PARAM_CONTAINER].getAttribute('action');

            form.resetToDefaults = function() {
                setFormData(form, form[PARAM_DEFAULT_DATA]);
            };
            form.changeField = function(name, value) {
                var data = {};
                fieldValue.set(name, value, data);
                setFormData(form, data, true);
            };
            form.changeFormData = function(data) {
                setFormData(form, data, true);
            };
            form.setField = function(name, value) {
                setFieldValueByName(form, name, value);
            };
            form.setFormData = function(data) {
                setFormData(form, data);
            };
            form.clearForm = function(fireCb) {
                fireCb = fireCb || false;

                objEach(form[PARAM_ELEMENTS], function(name, elem) {
                    var elemSample = elem[0] ? elem[0] : elem;

                    var value = null;

                    if (isElementDisabled(elemSample) || isElementHidden(elemSample)) {
                        return
                    }

                    var setResult = setFieldValue(elem, value);

                    if (!setResult) {
                        value = defaultValues[(elemSample.type || elemSample.tagName).toLowerCase()];
                    }

                    if (fireCb) {
                        onChange.call(form, null, name, form[PARAM_CONFIG][PARAM_VALIDATION_TYPE]);
                    }

                    fieldValue.set(name, value, form[PARAM_CURRENT_DATA]);
                })
            };
            form.fireFormChangeCallback = function(name) {
                onChange.call(form, null, name, form[PARAM_CONFIG][PARAM_VALIDATION_TYPE]);
            };
            form.fireOnFieldChangeCallbacks = function(name) {
                var onFieldChange = form[PARAM_CONFIG][PARAM_ON_FIELD_CHANGE] || false;
                if (!onFieldChange) {
                    return;
                }
                if (name) {
                    onFieldChange(name, fieldValue.get(name, form[PARAM_CURRENT_DATA]), form);
                    return;
                }
                objEach(form[PARAM_ELEMENTS], function(name, elem) {
                    onFieldChange(name, fieldValue.get(name, form[PARAM_CURRENT_DATA]), form);
                });
            };

            form.resetValidation = function() {
                validate.reset(form);
            };

            /* TODO check usages */
            form.getFieldValue = function(name) {
                return getFieldValueByName(form, name);
            };

            /* TODO check usages */
            form.getField = function (name) {
                return form[PARAM_ELEMENTS][name];
            };

            /* function is called before every submition or onChange */
            form[PARAM_VALIDATE] = function (fieldName) {
                if (fieldName) {
                    return validate.field(
                        form,
                        fieldName,
                        form[PARAM_CONFIG][PARAM_FIELDS][fieldName],
                        fieldValue.get(fieldName, form[PARAM_CURRENT_DATA]),
                        defaults[PARAM_ERROR_CLASS],
                        defaults[PARAM_WARNING_CLASS]
                    )
                }
                return form[PARAM_CONFIG][PARAM_VALIDATE] ?
                    form[PARAM_CONFIG][PARAM_VALIDATE](form, form[PARAM_CURRENT_DATA]) :
                    validate.process(form);
            };
            /*form.clear = clear.bind(form);*/

            form.notificationContainers = {};
            form.notificationContainers[FIELD_TYPE_ERROR] = {};
            form.notificationContainers[FIELD_TYPE_WARNING] = {};

            form.getErrorContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_ERROR, name, defaults[PARAM_ERROR_CLASS])
            };
            form.getWarningContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_WARNING, name, defaults[PARAM_WARNING_CLASS])
            };
            form.saveChanges = function () {
                /* stores saved changes */
                form[PARAM_DIFFERS_OBJ] = {};

                /* unfortunately for now we have to clone it */
                form[PARAM_INITIAL_DATA] = cloneObject(form[PARAM_CURRENT_DATA]);

                /* firing onChange with false */
                (opt[PARAM_CONFIG][PARAM_ON_CHANGE] || defaults[PARAM_ON_CHANGE])(!1, form);
                form[PARAM_IS_CHANGED] = !1;
            };
            form.getAllValues = function() {
                return formToArray(form[PARAM_CONTAINER])
            };

            /* pulling values for existing fields */
            form[PARAM_CURRENT_DATA] = formToArray(form[PARAM_CONTAINER]);
            form[PARAM_DEFAULT_DATA] = cloneObject(form[PARAM_CURRENT_DATA]);

            /* inserting fields into wrappers */
            insertFields(
                form,
                opt[PARAM_CONFIG][PARAM_FIELDS],
                !!(opt[PARAM_CONFIG][PARAM_FLAGS] & FLAG_DEBUG)
            );

            /* making a convenient elements object */
            form[PARAM_ELEMENTS] = {};
            for (var i = 0, elem; elem = form[PARAM_CONTAINER][i]; i++) {
                if (form[PARAM_ELEMENTS][elem.name]) {
                    if (isArray(form[PARAM_ELEMENTS][elem.name])) {
                        form[PARAM_ELEMENTS][elem.name].push(elem);
                    } else {
                        form[PARAM_ELEMENTS][elem.name] = Array[PARAM_PROTOTYPE].concat(form[PARAM_ELEMENTS][elem.name], elem);
                    }
                } else {
                    form[PARAM_ELEMENTS][elem.name] = elem;
                }
            }

            setFormData(form, form[PARAM_CONFIG][PARAM_DATA]);

            if (opt[PARAM_CONFIG][PARAM_ON_INIT]) {
                opt[PARAM_CONFIG][PARAM_ON_INIT](form);
            }

            bindFormEvents(form);

            form.saveChanges();

            if (opt[PARAM_CONFIG][PARAM_VALIDATION_TYPE] === VALIDATION_ASAP) {
                form[PARAM_VALIDATE]();
            }

            form.remove = function () {
                Forms.remove(opt[PARAM_CONFIG][PARAM_ID]);
            };

            form.remove();

            formsList[opt[PARAM_CONFIG][PARAM_ID]] = form;
        }

        this.create = Form;
    }

    return {
        Form: FormFactoryConstructor,
        remove: function (id) {
            if (formsList[id]) delete formsList[id]
        },
        getList: function () {
            return formsList
        },
        fv: fieldValue,
        VALIDATION_ON_SUBMIT: VALIDATION_ON_SUBMIT,
        VALIDATION_ON_CHANGE: VALIDATION_ON_CHANGE,
        VALIDATION_ASAP: VALIDATION_ASAP,
        FLAG_DEBUG: FLAG_DEBUG,
        FLAG_ASYNC: FLAG_ASYNC
    }
})();