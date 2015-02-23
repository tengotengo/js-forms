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
        PARAM_ON_VALIDATE = 'onValidate', /* just passing the validation result there. Returning false will prevent form from submitting */
        PARAM_ON_WARNING = 'onWarning', /* just passing the validation result there */
        PARAM_VALIDATE = 'validate', /* replaces standard form.validate() and passes form, form[PARAM_CURRENT_DATA]. */
        PARAM_VALIDATION_METHODS = 'validation', /* parameter for passing new validation methods */
        PARAM_DATA = 'data',
        PARAM_CURRENT_DATA = 'currentData',
        PARAM_INITIAL_DATA = 'initialData',
        PARAM_DIFFERS_OBJ = 'differsObj',
        PARAM_CONFIG = 'config',
        PARAM_CONTAINER = 'container',
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
        checkbox: ''
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
        setVal : function(namesArr, value, ref) {
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
            if (name == '') {
                if (!tmpObj.push) tmpObj = [];

                tmpObj.push(
                    next == '' ? [] : {}
                );
                name = tmpObj[PARAM_LENGTH] - 1;
            }
            tmpObj = tmpObj[name] = (typeof tmpObj[name] == 'object' && tmpObj[name] !== null) ? tmpObj[name] : (next == '' ? [] : {});
            fieldValue.setVal(namesArr, value, tmpObj)
        },
        set : function(fieldName, value, reference) {
            var arr = this.getPath(fieldName);

            fieldValue.setVal(arr, value, reference);
        }
    };
    function error() {
        throw new Error(Array[PARAM_PROTOTYPE].slice.call(arguments).join(', '))
    }
    function warning() {
        console.log(Array[PARAM_PROTOTYPE].slice.call(arguments).join(', '))
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

                    /* refreshing */
                    form[PARAM_CURRENT_DATA] = formToArray(form[PARAM_CONTAINER]);

                    var validationResult = form[PARAM_VALIDATE]();

                    if (validateCallback(validationResult)) {
                        /* adding params */
                        if (form[PARAM_CONFIG][PARAM_PARAMS]) {
                            for (var i in form[PARAM_CONFIG][PARAM_PARAMS]) {
                                fieldValue.set(i, form[PARAM_CONFIG][PARAM_PARAMS][i], form[PARAM_CURRENT_DATA]);
                            }
                        }

                        form[PARAM_DEFAULTS][PARAM_AJAX_FUNCTION](form.action, "POST", form[PARAM_CURRENT_DATA], (function (cb) {
                            return function (status, data) {
                                if (status) {
                                    form.saveChanges();
                                }
                                submitCallback.call(form, status, data, cb);
                            }
                        })(cb));

                        return !0;
                    }

                    return !1;
                };

            beforeSubmit(function () {
                if (onSubmit(callback)) afterSubmit()
            });
        };

        form[PARAM_CONTAINER].submit = form.submit = submit;

        bind(form[PARAM_CONTAINER], 'submit', function (e) {
            if (e.preventDefault) e.preventDefault();
            submit();
            e.returnValue = !1;
            return !1;
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
                        return !!elem.checked ? (elem.value || '1') : defaultValues.checkbox;
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

            if (fieldValue.get(name, result) === undefined && value === null) {
                fieldValue.set(name, null, result);
            }

            if (value === null) continue;

            if (element.hasAttribute('bitmask')) {
                value = parseInt(value, 10) || 0;

                value |= fieldValue.get(name, result);
                fieldValue.set(name, value, result);
                continue;
            }

            fieldValue.set(name, value, result);
        }

        return result;
    }
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
                /*setValue(el, (value !== null && value[i]) ? value[i] : null);*/
                if (setValue(el, value)) {
                    result = !0;
                }
            }
            return result;
        }

        /* if array of elements, like bitmask */
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
        if (!form.elements[name]) return;
        var setResult = setFieldValue(form.elements[name], value);
        if (!setResult) {
            return;
        }
        var elem = isArray(form.elements[name]) ? form.elements[name][0] : form.elements[name];
        if (!isElementDisabled(elem)) {
            fieldValue.set(name, value, form[PARAM_CURRENT_DATA]);
        }
    }
    function getFieldValueByName(form, name) {
        if (!form.elements[name]) return void 0;
        return fieldValue.get(name, formToArray(Array[PARAM_PROTOTYPE].concat(form.elements[name])))
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
    function elementsProcess(callback) {
        var setElements = !this.elements;
        if (setElements) {
            this.elements = {};
        }

        for (var i = 0, elem; elem = this[PARAM_CONTAINER][i]; i++) {
            if (setElements) {
                if (this.elements[elem.name]) {
                    if (isArray(this.elements[elem.name])) {
                        this.elements[elem.name].push(elem);
                    } else {
                        this.elements[elem.name] = Array[PARAM_PROTOTYPE].concat(this.elements[elem.name], elem);
                    }
                } else {
                    this.elements[elem.name] = elem;
                }
            }
            callback(elem);
        }
    }
    function isElementDisabled(elem) {
        return !!((elem.type && elem.type == 'disabled') || elem.disabled || elem.getAttribute('disabled'))
    }
    function clear() {
        elementsProcess.call(this, function (el) {
            this.setField(el.name, '')
        }.bind(this))
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

        for (var name in fieldsList) {
            var fieldName = name + '';
            var fieldData = fieldsList[fieldName];
            var fieldType = fieldData[DATA_TYPE_TYPE];

            if (!fieldType) continue;

            form[PARAM_FIELD_CONTAINER][fieldName] = findElementByNameAndType(container, fieldName, FIELD_TYPE_CONTAINER);

            if (!form[PARAM_FIELD_CONTAINER][fieldName]) continue;

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

            var notEmpty = !!fieldData[DATA_TYPE_NOT_EMPTY];

            form[PARAM_FIELD_CONTAINER][fieldName][PARAM_INNER_HTML] = (function (data, id, type, name, isLabel/*, notEmpty*/) {
                /* creating an html to insert into fieldContainer */
                var elementsData = [];

                var elementIndex = 1;

                var length = 0;
                for (var i in data) length++;

                var isMultiple = length >= 2;

                for (var key in data) {
                    var elementId = id + (isMultiple ? '-' + elementIndex : '');
                    var tmpElement, dataToPush = {};

                    var valueToSet = data[key] === null ? '' : data[key];

                    if (type == 'select') {
                        /*if (!notEmpty && i !== 0 && data[''] === undefined) {
                            tmpElement = '<option value=""></option>';
                            elementsData.push({input: tmpElement});
                            i = 0;
                        }*/
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
                }

                /* what's faster to generate text element and then acces it to bind stuff? or create element here, bind everything and append to the wrapper? */
                var str = generateElement(type, name, id, elementsData);

                return str ? str : elementsData[0]['input'];

            })(dataArr, fieldId, fieldType, fieldName, !!labelContainer/*, notEmpty*/);
        }
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
        defaults[PARAM_FIELD_CONTEXT] = def[PARAM_FIELD_CONTEXT] || function (a) {};
        defaults[PARAM_WARNING_CLASS] = def[PARAM_WARNING_CLASS] || 'warning';
        defaults[PARAM_ON_VALIDATE] = def[PARAM_ON_VALIDATE] || function (a) {
            var isValid = !0;

            for (var i in a) {
                if (a[i] != true) {
                    isValid = !1
                }
            }

            return isValid;
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
                    for (var type in params[DATA_TYPE_VALIDATE]) {
                        if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(params[DATA_TYPE_VALIDATE], type)) {
                            continue;
                        }

                        /* custom methods overwrite standard onse */
                        var validationMethod = validate.methods[type] || getStandartValidationMethod(type);

                        if (!validationMethod) continue;

                        if (type == 'required' || (value != '' && value !== null && typeof value != 'undefined')) {
                            fieldValid = validationMethod[VALIDATION_KEY_TEST](
                                value,
                                params[DATA_TYPE_VALIDATE][type]
                            );
                        }

                        if (!fieldValid) {
                            validate.showError(
                                form.getErrorContainer(fieldName),
                                validationMethod[VALIDATION_KEY_ERR].supplant({val: params[DATA_TYPE_VALIDATE][type]})
                            );
                            if (form.elements[fieldName] && form.elements[fieldName].name !== undefined) {
                                addClass(form.elements[fieldName], errorClass);
                            }
                            valid = !1;
                            break;
                        } else {
                            if (form.notificationContainers[FIELD_TYPE_ERROR][fieldName]) {
                                validate.hideError(
                                    form.getErrorContainer(fieldName)
                                );
                            }
                            if (form.elements[fieldName] && form.elements[fieldName].name !== undefined) {
                                removeClass(form.elements[fieldName], errorClass);
                            }
                        }
                    }
                }

                if (params[DATA_TYPE_WARNING]) {
                    for (var type in params[DATA_TYPE_WARNING]) {
                        if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(params[DATA_TYPE_WARNING], type)) {
                            continue;
                        }

                        var validationMethod = validate.methods[type] || getStandartValidationMethod(type);

                        if (!validationMethod) continue;

                        if (!valid) {
                            if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                                validate.hideError(
                                    form.getWarningContainer(fieldName)
                                );
                            }
                            continue;
                        }
                        if (type == 'required' || (value != '' && value !== null && typeof value != 'undefined')) {
                            fieldValid = validationMethod[VALIDATION_KEY_TEST](
                                value,
                                params[DATA_TYPE_WARNING][type]
                            );
                        }

                        if (!fieldValid) {
                            validate.showError(
                                form.getWarningContainer(fieldName),
                                validationMethod[VALIDATION_KEY_WARN].supplant({ val: params[DATA_TYPE_WARNING][type] })
                            );
                            if (form.elements[fieldName] && form.elements[fieldName].name !== undefined) {
                                addClass(form.elements[fieldName], warningClass);
                            }
                            valid = 'warning';
                            break;
                        } else {
                            if (form.notificationContainers[FIELD_TYPE_WARNING][fieldName]) {
                                validate.hideError(
                                    form.getWarningContainer(fieldName)
                                );
                            }
                            if (form.elements[fieldName] && form.elements[fieldName].name !== undefined) {
                                removeClass(form.elements[fieldName], warningClass);
                            }
                        }
                    }
                }
                return valid;
            },
            process: function (form, fields) {
                var valid = {};

                for (var i in fields) {
                    if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(fields, i)) {
                        continue;
                    }

                    if (!fields[i][DATA_TYPE_VALIDATE] && !fields[i][DATA_TYPE_WARNING]) {
                        continue;
                    }

                    valid[i] = validate.field(form, i, fields[i], fieldValue.get(i, form[PARAM_CURRENT_DATA]), defaults[PARAM_ERROR_CLASS], defaults[PARAM_WARNING_CLASS])
                }

                return valid;
            }
        };

        /* adding custom validations for all objects of current factory */
        if (def[PARAM_VALIDATION_METHODS]) {
            for (var method in def[PARAM_VALIDATION_METHODS]) {
                if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(def[PARAM_VALIDATION_METHODS], method)) {
                    continue;
                }

                validate.methods[method] = def[PARAM_VALIDATION_METHODS][method];
            }
        }

        function Form(conf) {
            var opt = {},
                form = this;

            opt[PARAM_INITIALIZED] = !1;
            opt[PARAM_DEFAULTS] = defaults;
            opt[PARAM_CONTAINER] = null;

            opt[PARAM_CONFIG] = conf || null;

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

            /* deprecated */
            form.getFormData = function () {
                return form[PARAM_CURRENT_DATA];
            };

            if (opt[PARAM_CONFIG][PARAM_ACTION]) {
                opt[PARAM_CONTAINER].setAttribute(PARAM_ACTION, opt[PARAM_CONFIG][PARAM_ACTION])
            }

            form.action = opt[PARAM_CONTAINER].getAttribute('action');

            /* TODO check usages */
            form.getFieldValue = function(name) {
                return getFieldValueByName(form, name);
            };

            form.setField = function(name, value, fireCb) {
                setFieldValueByName(form, name, value);
                if (fireCb && onFieldChange) {
                    onFieldChange(name, value)
                }
            };
            /* TODO fill using fieldValue */
            form.setFields = function(arr, fireCb) {
                for (var name in arr) {
                    if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(arr, name)) {
                        continue;
                    }
                    form.setField(name, arr[name], fireCb);
                }
            };

            /* TODO check usages */
            form.getField = function (name) {
                return form.elements[name];
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
                    validate.process(form, opt[PARAM_CONFIG][PARAM_FIELDS]);
            };
            form.clear = clear.bind(form);

            form.notificationContainers = {};
            form.notificationContainers[FIELD_TYPE_ERROR] = {};
            form.notificationContainers[FIELD_TYPE_WARNING] = {};

            form.getErrorContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_ERROR, name, defaults[PARAM_ERROR_CLASS])
            };

            form.getWarningContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_WARNING, name, defaults[PARAM_WARNING_CLASS])
            };

            var onFieldChange = opt[PARAM_CONFIG][PARAM_ON_FIELD_CHANGE] || false;

            /*
            * setting default values
            * setting values from data
            * onChange callback depends on validation type
            * tabIndexes
            * setting attributes to the fields TODO see if I can do this during the insertion
            * */
            form.initInputs = function () {
                var fieldsArr = opt[PARAM_CONFIG][PARAM_FIELDS] || {};
                var data = opt[PARAM_CONFIG][PARAM_DATA];
                var validationType = opt[PARAM_CONFIG][PARAM_VALIDATION_TYPE];
                var onChangeCallback = opt[PARAM_CONFIG][PARAM_ON_CHANGE] || defaults[PARAM_ON_CHANGE];

                var onChange = function (e, fieldName, type) {
                    /* "this" is a form object */
                    var oldValue = fieldValue.get(fieldName, this[PARAM_CURRENT_DATA]);
                    var newValue = form.getFieldValue(fieldName);
                    var initialValue = fieldValue.get(fieldName, this[PARAM_INITIAL_DATA]);

                    if (differs(oldValue, newValue, !0)) {
                        fieldValue.set(fieldName, newValue, this[PARAM_CURRENT_DATA]);
                        if (onFieldChange) onFieldChange(fieldName, newValue);
                    }

                    switch (type) {
                        case VALIDATION_ON_CHANGE:
                            if (e.type == 'blur') {
                                this[PARAM_VALIDATE](fieldName)
                            }
                            break;
                        case VALIDATION_ASAP:
                            this[PARAM_VALIDATE](fieldName);
                            break;
                        case VALIDATION_ON_SUBMIT:
                            break;
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
                };

                var processElement = function(elem) {
                    var name = elem.name;

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

                    if (fieldsArr[name]) {
                        /* insert classes and other attributes, validation */
                        for (var paramName in fieldsArr[name]) {
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
                                    attrArr = fieldsArr[name][paramName];
                                    for (var attr in attrArr) {
                                        elem.setAttribute(attr, attrArr[attr])
                                    }
                                    break;
                                case DATA_TYPE_CLASS:
                                    attrArr = fieldsArr[name][paramName];

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
                        }
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

                        elem[PARAM_INITIALIZED] = !0;
                    }
                };

                for (var name in form.elements) {
                    var elem = form.elements[name];
                    var value = fieldValue.get(name, data);

                    var setData = function(elem, elemSample) {
                        var defValue = !1;

                        var notEmpty = fieldsArr[name] ? !!fieldsArr[name][DATA_TYPE_NOT_EMPTY] : false;

                        /* if data didn't come */
                        if (value === undefined) {
                            /* any default values ? */

                            if (fieldsArr[name] && fieldsArr[name][DATA_TYPE_DEFAULT_VAL] !== undefined) {
                                value = fieldsArr[name][DATA_TYPE_DEFAULT_VAL];
                            } else if (fieldsArr[name] && fieldsArr[name][DATA_TYPE_DATA] && notEmpty) {
                                for (var i in fieldsArr[name][DATA_TYPE_DATA]) {
                                    if (!Object[PARAM_PROTOTYPE][PARAM_HAS_OWN_PROPERTY].call(fieldsArr[name][DATA_TYPE_DATA], i)) {
                                        continue;
                                    }
                                    value = fieldsArr[name][DATA_TYPE_DATA][i];
                                    break;
                                }
                            } else {
                                defValue = !0;
                                value = defaultValues[elemSample.type || elemSample.tagName]
                            }
                        }

                        if (fieldValue.get(name, form[PARAM_CURRENT_DATA]) !== undefined) {
                            return;
                        }

                        var setResult;

                        setResult = setFieldValue(elem, value);

                        if (!setResult) {
                            value = defaultValues[elemSample.type || elemSample.tagName]
                        }

                        fieldValue.set(name, value, form[PARAM_CURRENT_DATA]);
                    };

                    if (isArray(elem)) {
                        for (var i = 0, el; el = elem[i]; i++) {
                            processElement(el);
                        }
                        setData(elem, elem[0]);
                    } else {
                        processElement(elem);
                        setData(elem, elem);
                    }
                }
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

            form.resetToDefaults = function(fireCb) {
                var fieldsList = opt[PARAM_CONFIG][PARAM_FIELDS] || {};
                elementsProcess.call(form, function (elem) {
                    if (!fieldsList[elem.name]) {
                        return
                    }
                    var val = fieldsList[elem.name][DATA_TYPE_DEFAULT_VAL];
                    if (fieldsList[elem.name] && val !== undefined) {
                        setFieldValue(elem, val);
                        fieldValue.set(elem.name, val, form[PARAM_CURRENT_DATA]);
                        if (fireCb && onFieldChange) {
                            onFieldChange(elem.name, val)
                        }
                    }
                });
            };
            form.checkForm = function() {
                var allValues = form.getAllValues();
                alert(differs(allValues, form[PARAM_CURRENT_DATA], 1) ? 'something is wrong' : 'SUCCESSFUL');
            };

            form.getAllValues = function() {
                return formToArray(form[PARAM_CONTAINER])
            };

            /* before inserting, let's read all the existing fields into form[PARAM_CURRENT_DATA]  */
            form[PARAM_CURRENT_DATA] = formToArray(form[PARAM_CONTAINER]);

            /* inserting field into wrappers */
            insertFields(
                form,
                opt[PARAM_CONFIG][PARAM_FIELDS],
                !!(opt[PARAM_CONFIG][PARAM_FLAGS] & FLAG_DEBUG)
            );

            elementsProcess.call(form, function (elem) {});

            form.initInputs();

            if (opt[PARAM_CONFIG][PARAM_ON_INIT]) {
                opt[PARAM_CONFIG][PARAM_ON_INIT](form);
            }

            bindFormEvents(form);

            /* stores current changes */
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
        VALIDATION_ON_SUBMIT: VALIDATION_ON_SUBMIT,
        VALIDATION_ON_CHANGE: VALIDATION_ON_CHANGE,
        VALIDATION_ASAP: VALIDATION_ASAP,
        FLAG_DEBUG: FLAG_DEBUG,
        FLAG_ASYNC: FLAG_ASYNC
    }
})();