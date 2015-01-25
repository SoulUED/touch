/**
 * Created by margintan on 15/1/11.
 */
(function (win, doc){
    var _touchObject;

    _touchObject =  {};


    function combinationNodeNameIdClassNameByElement (_element) {
        var _id, _className,_nodeName;

        _nodeName = _element.nodeName.toLocaleLowerCase();

        _id = _element.id;
        _id = (_id && "#" + _id) || "";

        _className = _element.className && ("." + _element.className.replace(/\s/g, "."));


        return _nodeName + _id  + _className;
    }

    function replaceAllWhiteSpace (_string) {
        return _string.replace(/\s*/g, "");
    }

    function addCallbackTo (_elementRepresent, _event, _proxy, _callback) {
        var _stringCallback;

        if (!_callback) {
            if (!_touchObject[_elementRepresent].elementHasEvent[_elementRepresent]) {
                _touchObject[_elementRepresent].elementHasEvent[_elementRepresent] = {}
            }
            if (!_touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event]) {
                _touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event] = {}
            }

            _stringCallback = replaceAllWhiteSpace(_proxy.toString());
            _touchObject[_elementRepresent].elementHasEvent[_elementRepresent][_event][_stringCallback] = _proxy;
        }else{
            if (!_touchObject[_elementRepresent].elementHasEvent[_proxy]) {
                _touchObject[_elementRepresent].elementHasEvent[_proxy] = {}
            }
            if (!_touchObject[_elementRepresent].elementHasEvent[_proxy][_event]) {
                _touchObject[_elementRepresent].elementHasEvent[_proxy][_event] = {}
            }
            _stringCallback = replaceAllWhiteSpace(_callback.toString());

            _touchObject[_elementRepresent].elementHasEvent[_proxy][_event][_stringCallback] = _callback;
        }
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
            _rex = _rex + "[" + _id + "]{0,1}"
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
        var _element, _touchEventObject, _id, _className, _nodeName, _REX;

        _element = target;

        _id = _element.id && "#" + _element.id;
        _nodeName = _element.nodeName.toLocaleLowerCase();
        _className = _element.className && ("." + _element.className.replace(/\s/g, "."));

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

    function Touch(_elementRepresents, _element, _event, _proxy, _callback) {
        var _elementRepresent, thisActionType, startX, startY, endX, endY, _slideFireDistance, _slideError, _dragError;

        _elementRepresent = _elementRepresents;

        _touchObject[_elementRepresent] = {};
        _touchObject[_elementRepresent].elementHasEvent = {};
        _touchObject[_elementRepresent]._touchObject = this;

        _slideFireDistance = 20;
        _slideError = 30;
        _dragError = 30;

        function handleStart (e) {
            e.preventDefault();
            var _eToucheObject;
            _eToucheObject = e.touches[0];

            thisActionType = {};
            thisActionType.start = e.type;

            startX = _eToucheObject.clientX;
            startY = _eToucheObject.clientY;
        }

        function handleMove (e) {
            e.preventDefault();
            var _eToucheObject, moveX, moveY, dragX, dragY, _eventName, isHasEvent;

            thisActionType.move = e.type;

            debounce(function (e) {
                _eToucheObject = e.touches[0];

                moveX = _eToucheObject.clientX;
                moveY = _eToucheObject.clientY;

                dragX = Math.abs(startX - moveX);
                dragY = Math.abs(startY - moveY);

                if (dragX < _dragError || dragY < _dragError) {
                    if (dragX > dragY) {
                        if (moveX - startX > 0) {
                            _eventName = "dragLeft";
                        }else if (moveX -startX < 0) {
                            _eventName = "dragRight";
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
        }

        function handleEnd (e) {
            e.preventDefault();
            var isHasEvent, _eTouchObject, _slideDistanceY, _slideDistanceX, _eventName, _slideDirection;
            thisActionType.end = e.type;

            _eTouchObject = e.changedTouches[0];

            endX = _eTouchObject.clientX;
            endY = _eTouchObject.clientY;

            _slideDistanceY = Math.abs(startY - endY);
            _slideDistanceX = Math.abs(startX - endX);

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

            if (!thisActionType.move) {
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
        }

        _element.addEventListener("touchstart", handleStart, false);
        _element.addEventListener("touchmove", handleMove, false);
        _element.addEventListener("touchend", handleEnd, false);

        addCallbackTo(_elementRepresent, _event, _proxy, _callback);
    }

    Touch._fireEvent = function (target, e, offset) {
        var args = Array.prototype.slice.call(arguments,1);

        this.forEach(function (value) {
            value.apply(target, args);
        })
    };

    var _Touch = function (_element, _event, _proxy, _callback) {
        var _elementRepresent = combinationNodeNameIdClassNameByElement(_element);
        if (_touchObject[_elementRepresent]) {
            addCallbackTo(_elementRepresent, _event, _proxy, _callback);
            return _touchObject[_elementRepresent]._touchObject;
        }else{
            return new Touch(_elementRepresent, _element, _event, _proxy, _callback);
        }
    };

})(window, document);