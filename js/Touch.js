
(function (){
    var _touchObject, _touchEvent, TouchEvent;

    _touchObject =  {};
    _touchEvent = ["touchstart", "touchmove", "touchend"];


    function getNodeNameIdClassNameByElement (_element) {
        var _id, _className,_nodeName;

        _nodeName = _element.nodeName.toLocaleLowerCase();

        _id = _element.id;
        _id = (_id && "#" + _id) || "";

        _className = _element.className;
        _className = _className && ("." + _className.replace(/\s/g, "."));

        return {
            id: _id,
            nodeName: _nodeName,
            className: _className,
            all: _nodeName + _id  + _className
        };
    }

    function addCallbackTo (_elementRepresent, _event, _proxy, _callback) {
        if (!_callback) {
            _callback = _proxy;
            _proxy = _elementRepresent;
        }

        if (!_touchObject[_elementRepresent].elementHasEvent[_proxy]) {
            _touchObject[_elementRepresent].elementHasEvent[_proxy] = {}
        }
        if (!_touchObject[_elementRepresent].elementHasEvent[_proxy][_event]) {
            _touchObject[_elementRepresent].elementHasEvent[_proxy][_event] = {}
        }

        _touchObject[_elementRepresent].elementHasEvent[_proxy][_event][_callback.toString().replace(/\s*/g, "")] = _callback;
    }

    /**
     *
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     * the method comes from underscore
     */
    function debounce (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    function getFireEvent (e, _elementRepresent, _eventName) {
        var isHasEvent;

        isHasEvent = {};
        isHasEvent[_eventName] =[];
        getFireEvent._popUp(e.target, _elementRepresent, isHasEvent, _eventName);

        return isHasEvent ? isHasEvent : false;
    }

    getFireEvent._createRex = function (_nodeName, _id, _className) {
        var _classNameArr = _className && _className.split("."),
            _rex;

        _rex = "[" + _nodeName + "]*";

        if (_id) {
            _rex = _rex + "[" + _id + "]*"
        }

        if (_classNameArr) {
            _rex = _rex + "[";

            _classNameArr.forEach(function(value){
                if (value) {
                    value = "." + value + "|";
                    _rex = _rex + value;
                }
            });
            _rex  = _rex + "]*";
        }

        return _rex.replace(/\-/g, "\\-");
    };

    getFireEvent._popUp = function (target, _elementRepresent, isHasEvent, _eventName) {
        var _attributeNodeIdClass,_touchEventObject, _id, _className, _nodeName, _REX;

        _attributeNodeIdClass = getNodeNameIdClassNameByElement(target);
        _id = _attributeNodeIdClass.id;
        _nodeName = _attributeNodeIdClass.nodeName;
        _className = _attributeNodeIdClass.className;

        _touchEventObject = _touchObject[_elementRepresent].elementHasEvent;

        _REX =  new RegExp(getFireEvent._createRex(_nodeName, _id, _className));
        for (var i in _touchEventObject) {
            if ( i  == i.match(_REX)[0]) {
                for (var z in _touchEventObject[i][_eventName]) {
                    isHasEvent.target = target;
                    _touchEventObject[i][_eventName][z] && isHasEvent[_eventName].push(_touchEventObject[i][_eventName][z]);
                }
            }
        }

        if (target.parentNode) {
            getFireEvent._popUp(target.parentNode, _elementRepresent, isHasEvent, _eventName);
        }else{
            return false;
        }

    };

    function Touch(_elementRepresent, _element, _event, _proxy, _callback) {
        var thisActionType, startX, dateStart, dateEnd, startY, endX, endY, _slideFireDistance, _slideError, _dragError, _funcs;


        _touchObject[_elementRepresent] = {};
        _touchObject[_elementRepresent].elementHasEvent = {};
        _touchObject[_elementRepresent]._touchObject = this;

        _slideFireDistance = 20;
        _slideError = 30;
        _dragError = 30;

        _funcs = [function (e) {
            var _eToucheObject;

            _eToucheObject = e.touches[0];
            thisActionType = {};

            e.preventDefault();
            thisActionType.start = e.type;
            dateStart = Date.now();

            startX = _eToucheObject.clientX;
            startY = _eToucheObject.clientY;
        }, function (e) {
            var _eToucheObject, moveX, moveY, dragX, dragY, _eventName, isHasEvent;

            thisActionType.move = e.type;

            e.preventDefault();

            debounce(function (e) {
                _eToucheObject = e.touches[0];

                moveX = _eToucheObject.clientX;
                moveY = _eToucheObject.clientY;

                dragX = Math.abs(startX - moveX);
                dragY = Math.abs(startY - moveY);

                if (dragX < _dragError || dragY < _dragError) {
                    if (dragX > dragY) {
                        if (moveX - startX > 0) {
                            _eventName = "dragRight";
                        }else if (moveX -startX < 0) {
                            _eventName = "dragLeft";
                        }
                    }else if (dragX < dragY) {
                        if (moveY - startY > 0) {
                            _eventName = "dragDown";
                        }else if (moveY - startY < 0) {
                            _eventName = "dragUp";
                        }
                    }
                }

                isHasEvent = _eventName && getFireEvent(e, _elementRepresent, _eventName);
                if (!isHasEvent) return;

                isHasEvent[_eventName][0] && Touch._fireEvent.call(isHasEvent[_eventName], isHasEvent.target, e, {
                    x: dragX,
                    y: dragY
                });

            }, 100)(e);
        }, function (e) {
            var isHasEvent, _eTouchObject, _slideDistanceY, _slideDistanceX, _eventName, _slideDirection;
            thisActionType.end = e.type;

            _eTouchObject = e.changedTouches[0];

            endX = _eTouchObject.clientX;
            endY = _eTouchObject.clientY;
            _slideDistanceY = Math.abs(startY - endY);
            _slideDistanceX = Math.abs(startX - endX);
            dateEnd = Date.now();

            e.preventDefault();

            /**
             * _slideDirection: 1 up
             * _slideDirection: 2 down
             * _slideDirection: 4 right
             * _slideDirection: 3 Left
             */
            if (_slideDistanceX <= _slideError || _slideDistanceY <= _slideError) {
                if (_slideDistanceY > _slideDistanceX) {
                    if (startY - endY > 0) {
                        _slideDirection = 1;
                    }else if (startY - endY < 0){
                        _slideDirection = 2;
                    }
                }else if (_slideDistanceY < _slideDistanceX) {
                    if (startX - endX > 0) {
                        _slideDirection = 3;
                    }else if (startX - endX < 0){
                        _slideDirection = 4;
                    }
                }
            }

            if (dateEnd - dateStart < TouchEvent.tapTime || !thisActionType.move) {
                _eventName = "tap";
            }else if(thisActionType.move){
                if (_slideDistanceY >= _slideFireDistance || _slideDistanceX >= _slideFireDistance) {
                    switch (_slideDirection) {
                        case 1:
                            _eventName = "slideUp";
                            break;
                        case 2:
                            _eventName = "slideDown";
                            break;
                        case 4:
                            _eventName = "slideRight";
                            break;
                        case 3:
                            _eventName = "slideLeft";
                            break;
                    }
                }
            }

            isHasEvent = _eventName && getFireEvent(e, _elementRepresent, _eventName);
            if (!isHasEvent) return;

            isHasEvent[_eventName][0] && Touch._fireEvent.call(isHasEvent[_eventName], isHasEvent.target, e, {
                slideX: _slideDistanceX,
                slideY: _slideDistanceY
            });
        }];


        _touchEvent.forEach(function (value,index) {
            _element.addEventListener(value, _funcs[index], false);
        });

        addCallbackTo(_elementRepresent, _event, _proxy, _callback);
    }

    Touch._fireEvent = function (target, e, offset) {
        var args = Array.prototype.slice.call(arguments,1);

        this.forEach(function (value) {
            value.apply(target, args);
        })
    };

    TouchEvent = function (_element, _event, _proxy, _callback) {
        var _elementRepresent = getNodeNameIdClassNameByElement(_element).all;
        if (_touchObject[_elementRepresent]) {
            addCallbackTo(_elementRepresent, _event, _proxy, _callback);
            return _touchObject[_elementRepresent]._touchObject;
        }else{
            return new Touch(_elementRepresent, _element, _event, _proxy, _callback);
        }
    };
    
    TouchEvent.tapTime = 300;

    if ( typeof module != 'undefined' && module.exports ) {
        module.exports = TouchEvent;
    }

})();