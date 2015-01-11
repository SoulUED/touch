/**
 * Created by margintan on 15/1/11.
 */
(function (win, doc){
    var _counter, _touchObject, _forEach;

    _touchObject =  {};
    _forEach = Array.prototype.forEach;


    function combinationNodeNameIdClassNameByElement (_element) {
        var _id, _className, _nodeName;

        _nodeName = _element.nodeName;

        _id = _element.id;
        _id = (_id && "#" + _id) || "";

        _className = "";
        _forEach.call(_element.classList, function (value){
            value = "." + value;
            _className = _className + value;
        });

        return _nodeName + _id + _className;
    }

    function replaceAllWhiteSpace (_string) {
        return _string.replace(/\s*/g, "");
    }

    function addCallbackTo (_elementRepresent, _event, _proxy, _callback) {
        var _stringCallback;
        if (!_touchObject[_elementRepresent][_event]) {
            _touchObject[_elementRepresent][_event] = {};
        }
        if (!_callback) {
            _stringCallback = replaceAllWhiteSpace(_proxy.toString());

            if (!_touchObject[_elementRepresent][_event]._self ) {
                _touchObject[_elementRepresent][_event]._self = {};
            }
            _touchObject[_elementRepresent][_event]._self[_stringCallback] = _proxy;
        }else{
            _stringCallback = replaceAllWhiteSpace(_callback.toString());

            if (!_touchObject[_elementRepresent][_event][_proxy]) {
                _touchObject[_elementRepresent][_event][_proxy] = {};
            }

            _touchObject[_elementRepresent][_event][_proxy][_stringCallback] = _callback;
        }
    }


    function Touch(_element, _event, _proxy, _callback) {
        var _elementRepresent = combinationNodeNameIdClassNameByElement(_element);

        _touchObject[_elementRepresent] = {};
        _touchObject[_elementRepresent]._touchObject = this;

        addCallbackTo(_elementRepresent, _event, _proxy, _callback);

        function handleStart () {}

        function handleMove () {}

        function handleEnd () {}

        _element.addEventListener("touchstart", handleStart, false);
        _element.addEventListener("touchmove", handleMove, false);
        _element.addEventListener("touchend", handleEnd, false);

    }


    var _Touch = function (_element, _event, _proxy, _callback) {
        var _elementRepresent = combinationNodeNameIdClassNameByElement(_element);

        if (_touchObject[_elementRepresent]) {
            addCallbackTo(_elementRepresent, _event, _proxy, _callback);
            return _touchObject[_elementRepresent]._touchObject;
        }else{
            return new Touch(_element, _event, _proxy, _callback);
        }
    };

    _Touch(document.getElementsByClassName("name")[0], "tap", function (){
        alert("123");
    });

    _Touch(document.getElementsByClassName("name")[0], "dragLeft", function (){
        alert("456");
    });

    _Touch(document.getElementsByClassName("name")[0], "dragLeft", function (){
        alert("789");
    });
    _Touch(document.getElementById("test"), "dragLeft", function (){
        alert("789");
    });

})(window, document);