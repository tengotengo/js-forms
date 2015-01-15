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
        PARAM_FIELD_CONTEXT = 'fieldContext',
        PARAM_FORM_CONTEXT = 'formContext',
        PARAM_AFTER_SUBMIT = 'afterSubmit',
        PARAM_FIELDS = 'fields',
        PARAM_VALIDATION_TYPE = 'validationType',
        PARAM_ON_FIELD_CHANGE = 'onFieldChange',
        PARAM_ON_CHANGE = 'onChange',
        PARAM_ON_INIT = 'onInit',
        PARAM_ON_VALIDATE = 'onValidate',
        PARAM_VALIDATE = 'validate',
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
        MSG_NO_ELEMENT = 'No such element on the page';

    var VALIDATION_ON_SUBMIT = 1,
        VALIDATION_ON_CHANGE = 2,
        VALIDATION_ON_KEYUP = 3;

    var VALIDATION_KEY_TEST = 2,
        VALIDATION_KEY_ERR = 0,
        VALIDATION_KEY_WARN = 1;

    var globalTabIndex = 0;
    var fieldUniqueCounter = 1;
    var formsList = {};

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
                return val.length == rule
            }
        ],
        'maxLength': [
            'Must be <= {val} characters long',
            'Should be less than {val} characters long',
            function (val, rule) {
                return val.length <= rule
            }
        ],
        'minLength': [
            'Must be >= {val} characters long',
            'Should be more than {val} characters long',
            function (val, rule) {
                return val.length <= rule
            }
        ],
        'required': [
            'Required field',
            'This field is highly recommended to fill',
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

            for (var i = 0; i < arr.length; i++) {
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
            if (!namesArr.length) {
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
                name = tmpObj.length - 1;
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
        throw new Error(Array.prototype.slice.call(arguments).join(', '))
    }
    function warning() {
        console.log(Array.prototype.slice.call(arguments).join(', '))
    }
    function bindFormEvents(form) {
        if (!(form.config[PARAM_FLAGS] & FLAG_ASYNC)) {
            /* if not async */
            form.submit = function (callback) {
                form.container.submit(callback);
            };
            return;
        }

        var submit = function () {
            var lastOne = arguments[arguments.length - 1];
            var callback = typeof lastOne == 'function' ? lastOne : function() {};

            var submitCallback = form.config[PARAM_SUBMIT_CALLBACK] || form.defaults.submitCallback,
                validateCallback = form.config[PARAM_ON_VALIDATE] || form.defaults.validateCallback,
                beforeSubmit = form.config[PARAM_BEFORE_SUBMIT] || form.defaults.beforeSubmitCallback,
                afterSubmit = form.config[PARAM_AFTER_SUBMIT] || form.defaults.afterSubmitCallback,
                onSubmit = form.config[PARAM_ON_SUBMIT] || function (cb) {
                    cb = cb || function() {};

                    var isValid = form.validate();

                    validateCallback(isValid);

                    if (isValid) {
                        var data = form.getFormData();

                        if (form.config[PARAM_PARAMS]) {
                            for (var i in form.config[PARAM_PARAMS]) {
                                data[i] = form.config[PARAM_PARAMS][i];
                            }
                        }

                        form.defaults.ajax(form.action, "POST", data, (function (cb) {
                            return function (status, data) {
                                submitCallback.call(form, status, data, cb);
                            }
                        })(cb));

                        form.saveChanges();

                        return !0;
                    }

                    return !1;
                };

            beforeSubmit(function () {
                if (onSubmit(callback)) afterSubmit()
            });
        };

        form.container.submit = form.submit = submit;

        bind(form.container, 'submit', function (e) {
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
    function formToArray(formContainer, emptyFields) {
        var result = {};

        if (!formContainer.length) {
            return result;
        }

        for (var i = 0, element; element = formContainer[i]; i++) {
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

            var value = getFieldValue(element);

            if (emptyFields && fieldValue.get(name, result) === undefined && value === null) {
                fieldValue.set(name, null, result);
            }

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
    function setFieldValue(elem, value) {
        if (!elem) return;

        var setValue = function (el, val) {
            var tagName = el.tagName.toLowerCase();

            switch (tagName) {
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
                        el.selectedIndex = -1
                    } else {
                        el.selectedIndex = found
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
            for (var i = 0, el; el = elem[i]; i++) {
                setValue(el, value !== null && value[i] ? value[i] : null);
            }
            return;
        }
        if (elem.length && !elem.tagName) {
            for (var i = 0, el; el = elem[i]; i++) {
                setValue(el, value);
            }
            return;
        }

        setValue(elem, value);
    }
    function fireEvent(obj, evt) {
        if (obj === undefined) return;
        var evObj;
        if (document.createEvent) {
            evObj = document.createEvent('MouseEvents');
            evObj.initEvent(evt, !0, !1);
            if (obj.length && obj.name == undefined) {
                for (var i = 0; i < obj.length; i++)  obj[i].dispatchEvent(evObj)
                return
            }
            obj.dispatchEvent(evObj);
        } else if (document.createEventObject) { //IE
            evObj = document.createEventObject();
            if (obj.fireEvent === undefined || typeof obj.fireEvent != 'function') {
                return;
            }
            obj.fireEvent('on' + evt, evObj);
        }
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

        for (var i = 0, elem; elem = this.container[i]; i++) {
            if (setElements) {
                if (this.elements[elem.name]) {
                    if (Object.prototype.toString.call(this.elements[elem.name]) === "[object Array]") {
                        this.elements[elem.name].push(elem);
                    } else {
                        this.elements[elem.name] = Array.prototype.concat(this.elements[elem.name], elem);
                    }
                } else {
                    this.elements[elem.name] = elem;
                }
            }
            callback(elem);
        }
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
            var errorContainer = findElementByNameAndType(this.container, name, type);
            if (!errorContainer) {
                if (!this.fieldContainers[name]) return;

                errorContainer = createMsgContainer(name, type, this.fieldContainers[name].tagName);
                this.fieldContainers[name].parentNode.insertBefore(errorContainer, this.fieldContainers[name].nextSibling);
            }
            if (!errorContainer.children.length) {
                errorContainer.appendChild(createTextContainer(classname, this.options.defaults.hideClass));
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
        if (result && result.length === void 0) return result;
        if (result.length == 1) return result[0];

        return result[0] ? result : null;
    }
    function insertFields(form, fieldsList, uniqueLabels, debugMode) {
        debugMode = debugMode || !1;
        uniqueLabels = uniqueLabels || !1;

        if (!fieldsList) return;

        var container = form.container;

        form.errorContainers = {};
        form.warningContainers = {};
        form.fieldContainers = {};

        var getLabelElement = function (text, forId) {
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

            form.fieldContainers[fieldName].innerHTML = (function (data, id, type, name, isLabel) {
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
                        if (i !== 0) {
                            tmpElement = '<option value=""></option>';
                            elementsData.push({input: tmpElement});
                            i = 0;
                        }
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

                var str = generateElement(type, name, id, elementsData);

                return str ? str : elementsData[0]['input'];

            })(dataArr, fieldId, fieldType, fieldName, !!labelContainer);
        }
    }

    /* IE8 fix */
    (function (d, g) {
        if (window.Element === undefined) return;
        d[g] || (d[g] = function (g) {
            return this.querySelectorAll("." + g)
        }, Element.prototype[g] = d[g])
    })(document, "getElementsByClassName");

    function FormFactoryConstructor(def) {
        /* private static for every object of this factory */
        var defaults = {
            flags: def['flags'] || 0,
            validationType: def['validationType'] || Forms.VALIDATION_ON_SUBMIT,
            hideClass: def['hideClass'] || 'h',
            errorClass: def['errorClass'] || 'error',
            warningClass: def['warningClass'] || 'warning',
            ajax: def['ajax'] || function (url, method, data, successCallback, errorCallback) {
                var request = new XMLHttpRequest();
                errorCallback = errorCallback || function () {};

                request.open(method, url);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                request.send(fieldValue.serialize(data, null));

                request.onreadystatechange = function () {
                    if (request.status == 200 && request.readyState == 4) {
                        successCallback(request.status, request.response);
                    }
                    if (request.status != 200) {
                        errorCallback()
                    }
                };
            },
            onChange: def['onChange'] || function (a, b) {},
            formContext: def['formContext'] || function (a) {},
            fieldContext: def['fieldContext'] || function (a) {},
            submitCallback: def['submitCallback'] || function (a, b, c) {
                c();
                return !0;
            },
            validateCallback: def['validateCallback'] || function (a) {
                return !0;
            },
            beforeSubmitCallback: def['beforeSubmitCallback'] || function (c) {
                c();
                return !0;
            },
            afterSubmitCallback: def['afterSubmitCallback'] || function () {
                return !0;
            }
        };
        var validate = {
            methods: {},
            hideError: function (warningObj) {
                if (!warningObj) return;
                addClass(warningObj, defaults.hideClass);
            },
            showError: function (warningObj, text) {
                if (!warningObj) return;
                warningObj.innerHTML = text;
                removeClass(warningObj, defaults.hideClass);
            },
            field: function (form, fieldName, params, value, errorClass, warningClass) {
                var fieldValid = !0;
                var valid = !0;

                if (params[DATA_TYPE_VALIDATE]) {
                    for (var type in params[DATA_TYPE_VALIDATE]) {
                        if (!Object.prototype.hasOwnProperty.call(params[DATA_TYPE_VALIDATE], type)) {
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
                            console.log(fieldName, 'is not valid');
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
                        if (!Object.prototype.hasOwnProperty.call(params[DATA_TYPE_WARNING], type)) {
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
                var data = form.getFormData(1), valid = !0;

                for (var i in fields) {
                    if (!Object.prototype.hasOwnProperty.call(fields, i)) {
                        continue;
                    }

                    if (!fields[i][DATA_TYPE_VALIDATE] && !fields[i][DATA_TYPE_WARNING]) {
                        continue;
                    }

                    if (!validate.field(form, i, fields[i], data[i], defaults.errorClass, defaults.warningClass)) {
                        valid = !1;
                    }
                }

                return valid;
            }
        };

        /* adding custom validations for all objects of current factory */
        if (def['validation']) {
            for (var method in def['validation']) {
                if (!Object.prototype.hasOwnProperty.call(def['validation'], method)) {
                    continue;
                }

                validate.methods[method] = def['validation'][method];
            }
        }

        function Form(conf) {
            var opt = {
                    cache: null,
                    formDataCache: null,
                    config: null,
                    defaults: defaults,
                    initialized: !1,
                    container: null
                },
                form = this;

            opt.config = opt.config || conf;

            function processConfig(c) {
                /* TODO check if incoming object is valid */
                return !!c
            }

            form.init = function (c) {
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
            form.differsObj = {};
            form.prevValues = {};
            form.valuesCache = {};
            form.lastChangedStatus = !1;

            form.config = opt.config;
            form.options = opt;
            form.defaults = defaults;

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
                opt.config[PARAM_ID] = form.container.getAttribute('id');
            }

            if (!form.container) return;

            opt.config[PARAM_FLAGS] = opt.config[PARAM_FLAGS] ? (opt.config[PARAM_FLAGS] | defaults.flags) : defaults.flags;

            if (!opt.config[PARAM_VALIDATION_TYPE]) {
                opt.config[PARAM_VALIDATION_TYPE] = defaults.validationType;
            }

            console.log('opt.config[PARAM_FLAGS]', opt.config[PARAM_FLAGS]);

            var emptyFields = !!(opt.config[PARAM_FLAGS] & FLAG_SUBMIT_EMPTY);
            form.getFormData = function (renewCache) {
                if (opt.formDataCache && !form.isChanged && !renewCache) {
                    /* TODO rethink how to make it without cloning an object, feels wrong */
                    return cloneObject(opt.formDataCache);
                }
                opt.formDataCache = formToArray(form.container, emptyFields);
                return opt.formDataCache;
            };

            if (opt.config[PARAM_ACTION]) {
                opt.container.setAttribute(PARAM_ACTION, opt.config[PARAM_ACTION])
            }

            form.action = opt.container.getAttribute('action');

            form.setField = function (name, value) {
                if (!form.elements[name]) return;
                setFieldValue(form.elements[name], value);
                fireEvent(form.elements[name], 'formChange');
            };
            form.setFields = function (arr) {
                for (var i in arr) {
                    if (!Object.prototype.hasOwnProperty.call(arr, i)) {
                        continue;
                    }
                    if (!form.elements[i]) continue;

                    setFieldValue(form.elements[i], arr[i]);
                    fireEvent(form.elements[i], 'formChange');
                }

                form.getFormData(!0);
            };
            form.getField = function (name) {
                return form.elements[name];
            };
            form.validate = function (fieldName) {
                if (fieldName) {
                    var data = form.getFormData(!0);

                    return validate.field(
                        form,
                        fieldName,
                        form.config[PARAM_FIELDS][fieldName],
                        data[fieldName],
                        defaults.errorClass,
                        defaults.warningClass
                    )
                }
                return form.config[PARAM_VALIDATE] ?
                    form.config[PARAM_VALIDATE](form, form.getFormData(1)) :
                    validate.process(form, opt.config[PARAM_FIELDS]);
            };
            form.clear = clear.bind(form);

            form.notificationContainers = {};
            form.notificationContainers[FIELD_TYPE_ERROR] = {};
            form.notificationContainers[FIELD_TYPE_WARNING] = {};

            form.getErrorContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_ERROR, name, defaults.errorClass)
            };

            form.getWarningContainer = function (name) {
                return getNotificationContainer.call(form, FIELD_TYPE_WARNING, name, defaults.warningClass)
            };

            form.initInputs = function () {
                var fieldsList = opt.config[PARAM_FIELDS] || {};
                var data = opt.config[PARAM_DATA];
                var validationType = opt.config[PARAM_VALIDATION_TYPE];
                var onChangeCallback = this.config[PARAM_ON_CHANGE] || defaults.onChange;
                var onFieldChange = this.config[PARAM_ON_FIELD_CHANGE] || function (a, b) { console.log('fieldChange fired', arguments )};

                var onChange = function (e, fieldName, type) {
                    var prevValue = fieldValue.get(fieldName, this.prevValues);
                    var savedValue = fieldValue.get(fieldName, this.valuesCache);
                    var currentValue = fieldValue.get(fieldName, this.getFieldValue(fieldName));

                    switch (type) {
                        case VALIDATION_ON_CHANGE:
                            if (e.type == 'blur') {
                                this.validate(fieldName)
                            }
                            break;
                        case VALIDATION_ON_KEYUP:
                            this.validate(fieldName);
                            break;
                        case VALIDATION_ON_SUBMIT:
                            fieldValue.set(fieldName, currentValue, this.options.formDataCache);
//                            this.getFormData(!0);
                            break;
                    }

                    if (differs(savedValue, currentValue)) {
                        fieldValue.set(fieldName, !0, this.differsObj);
                    } else {
                        fieldValue.del(fieldName, this.differsObj);
                    }

                    this.isChanged = differs(this.differsObj, {});

                    if (this.isChanged != this.lastChangedStatus) {
                        onChangeCallback(this.isChanged, this);
                        this.lastChangedStatus = !!this.isChanged;
                    }

                    if (differs(prevValue, currentValue)) {
                        onFieldChange(fieldName, currentValue);
                        fieldValue.set(fieldName, currentValue, this.prevValues);
                    }
                };

                elementsProcess.call(form, function (elem) {
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

                    var name = elem.name;
                    var value = fieldValue.get(name, data);

                    if (fieldsList[name]) {
                        /* setting default values */
                        if (fieldsList[name]['defaultVal'] !== undefined && value === undefined) {
                            setFieldValue(elem, fieldsList[name]['defaultVal']);
                            fieldValue.set(name, fieldsList[name]['defaultVal'], form.prevValues);
                        }

                        /* insert classes and other attributes, validation */
                        for (var paramName in fieldsList[name]) {
                            var attrArr = null;

                            switch (paramName) {
                                case DATA_TYPE_DISABLED:
                                case DATA_TYPE_BITMASK:
                                    if (elem.length) {
                                        for (var i = 0, subElem; subElem = elem[i]; i++) {
                                            subElem.setAttribute(paramName, '1');
                                        }
                                    } else {
                                        elem.setAttribute(paramName, '1');
                                    }
                                    break;
                                case DATA_TYPE_ATTRIBUTES:
                                    attrArr = fieldsList[name][paramName];
                                    for (var attr in attrArr) {
                                        elem.setAttribute(attr, attrArr[attr])
                                    }
                                    break;
                                case DATA_TYPE_CLASS:
                                    attrArr = fieldsList[name][paramName];

                                    if (typeof attrArr == 'string') {
                                        addClass(elem, attrArr);
                                    } else {
                                        try {
                                            for (var i = 0; i < attrArr.length; i++) {
                                                addClass(elem, attrArr[i]);
                                            }
                                        } catch (e) {}
                                    }
                                    break;
                            }
                        }
                    }
                    if (value !== undefined && value !== null) {
                        setFieldValue(elem, value);
                        fieldValue.set(name, value, form.prevValues);
                    }

                    /* bind change events */
                    if (!elem.initialized) {
                        var eventFunc = function (n) {
                            return function (e) {
                                onChange.call(this, e, n, validationType)
                            }.bind(this)
                        }.call(form, elem.name);

                        bind(elem, 'blur', eventFunc);
                        bind(elem, 'click', eventFunc);
                        bind(elem, 'keyup', eventFunc);
                        bind(elem, 'formChange', eventFunc);

                        elem.initialized = !0;
                    }
                });
            };
            form.saveChanges = function () {
                /* stores saved changes */
                form.differsObj = {};
                form.lastChangedStatus = !1;
                form.prevValues = form.getFormData();
                form.valuesCache = form.getFormData();
                (opt.config[PARAM_ON_CHANGE] || defaults.onChange)(!1, form);
                form.isChanged = !1;
            };

            /* inserting field into wrappers */
            insertFields(
                form,
                opt.config[PARAM_FIELDS],
                !!(opt.config[PARAM_FLAGS] & FLAG_UNIQUE_LABELS),
                !!(opt.config[PARAM_FLAGS] & FLAG_DEBUG)
            );
            form.getFieldValue = function(name) {
                if (!form.elements[name]) return;
                return formToArray(Array.prototype.concat(form.elements[name]), emptyFields);
            };

            form.initInputs();

            if (opt.config[PARAM_ON_INIT]) {
                opt.config[PARAM_ON_INIT](form);
            }

            /* stores current changes */
            bindFormEvents(form);

            form.saveChanges();

            if (opt.config[PARAM_VALIDATION_TYPE] === VALIDATION_ON_KEYUP) {
                form.validate();
            }

            form.remove = function () {
                Forms.remove(opt.config[PARAM_ID]);
            };

            form.remove();

            formsList[opt.config[PARAM_ID]] = form;
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
        VALIDATION_ON_KEYUP: VALIDATION_ON_KEYUP,
        FLAG_DEBUG: FLAG_DEBUG,
        FLAG_SUBMIT_EMPTY: FLAG_SUBMIT_EMPTY,
        FLAG_UNIQUE_LABELS: FLAG_UNIQUE_LABELS,
        FLAG_ASYNC: FLAG_ASYNC
    }
})();