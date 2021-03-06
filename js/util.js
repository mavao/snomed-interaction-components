/**
 * Created by alo on 7/18/14.
 */
icon = document.createElement("img");
channel = postal.channel("Selections");

Handlebars.registerHelper('i18n', function (i18n, defaultV){
    if (typeof window[i18n] == "undefined"){
        //console.log(i18n, "=", defaultV);
        return defaultV;
    }else{
        return window[i18n];
    }
});

Handlebars.registerHelper('if_undefined', function (a, opts) {
    if (opts != "undefined") {
        if (typeof a == "undefined")
            return opts.fn(this);
        else
            return opts.inverse(this);
    }
});

Handlebars.registerHelper("if_eqInd", function(a, b, opts){
    if ((parseInt(a) + 1) == parseInt(b))
        return opts.fn(this);
    else
        return opts.inverse(this);
});

Handlebars.registerHelper("console", function(a){
    console.log(a);
});

$(document).on('dragend', function(){
    removeHighlight();
});

function removeHighlight(){
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
}

function allowDrop(ev) {
    ev.preventDefault();

    var aux;
    if ($(ev.target).attr("data-droppable") == "true"){
        aux = $(ev.target);
    }else{
        aux = $(ev.target).closest("div");
    }
//    while (typeof $(aux).closest('div').attr('ondrop') != "undefined"){
//        aux = $(aux).closest('div');
//    }
    $(aux).addClass("drop-highlighted");
}

function dropField(ev){
    var text = ev.dataTransfer.getData("Text");
    if (text != "javascript:void(0);"){
        var i = 0;
        while (text.charAt(i) != "|" && i < text.length){
            i++;
        }
        var conceptId = ev.dataTransfer.getData("concept-id");
        if (typeof conceptId == "undefined" && i < text.length){
            conceptId = text.substr(0, i);
        }
        var term = ev.dataTransfer.getData("term");
        if (typeof term == "undefined"){
            term = text.substr(i);
        }
        $(ev.target).val(term);
        $(ev.target).attr("data-conceptId", conceptId);
    }
}

function iconToDrag(text){
    var CVS = document.createElement('canvas'),
        ctx = CVS.getContext('2d');
    CVS.width  = 300;
    CVS.height = 300;
    ctx.font = "15px sans-serif";
    ctx.strokeText(text, 10, 20);
    var icon = document.createElement("img");
    icon.src = CVS.toDataURL();
    return icon;
}

function drag(ev, id) {
    var dataText = "";
    var term = "", conceptId = "";
    $.each(ev.target.attributes, function (){
        if (this.name.substr(0, 4) == "data"){
            ev.dataTransfer.setData(this.name.substr(5), this.value);
            if (this.name.substr(5) == "concept-id"){
                conceptId = this.value;
            }
            if (this.name.substr(5) == "term"){
                term = this.value;
            }
        }
    });
    icon = iconToDrag(term);
    if (navigator.userAgent.indexOf("Chrome") > -1){
        icon = iconToDrag(term);
        ev.dataTransfer.setDragImage(icon, 0, 0);
    }else{
//            icon = iconToDrag(term);
    }
    ev.dataTransfer.setDragImage(icon, 0, 0);
    dataText = conceptId + "|" + term;
    ev.dataTransfer.setData("Text", dataText);
    ev.dataTransfer.setData("divElementId", id);
}

function dropS(ev){
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var text = ev.dataTransfer.getData("Text");
    if (text != "javascript:void(0);"){
        var i = 0;
        while (text.charAt(i) != "|" && i < text.length){
            i++;
        }
        var conceptId = ev.dataTransfer.getData("concept-id");
        if (typeof conceptId == "undefined" && i < text.length){
            conceptId = text.substr(0, i);
        }
        var term = ev.dataTransfer.getData("term");
        if (typeof term == "undefined"){
            term = text.substr(i);
        }
        $(ev.target).val(term);
        var id = $(ev.target).attr("id").replace("-searchBox", "");
        $.each(componentsRegistry, function(i, field) {
            if (field.divElement.id == id) {
                field.search(term, 0, 100, false);
            }
        });
    }
}

function dropC(ev, id) {
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var text = ev.dataTransfer.getData("Text");
    if (text != "javascript:void(0);"){
        var i = 0;
        while (text.charAt(i) != "|" && i < text.length){
            i++;
        }
        var conceptId = ev.dataTransfer.getData("concept-id");
        if (typeof conceptId == "undefined" && i < text.length){
            conceptId = text.substr(0, i);
        }
        var term = ev.dataTransfer.getData("term");
        if (typeof term == "undefined"){
            term = text.substr(i);
        }
        var divElementID = id;
        var panelAct;
        $.each(componentsRegistry, function (i, field){
            if (field.divElement.id == divElementID){
                panelAct = field;
            }
        });
        if (conceptId && panelAct.conceptId != conceptId) {
            panelAct.conceptId = conceptId;
            panelAct.updateCanvas();
            channel.publish(panelAct.divElement.id, {
                term: term,
                conceptId: panelAct.conceptId,
                source: panelAct.divElement.id
            });
        }
    }

}

function dropF(ev, id) {
    var text = ev.dataTransfer.getData("Text");
    if (text != "javascript:void(0);"){
        var i = 0;
        while (text.charAt(i) != "|" && i < text.length){
            i++;
        }
        var conceptId = ev.dataTransfer.getData("concept-id");
        if (typeof conceptId == "undefined" && i < text.length){
            conceptId = text.substr(0, i);
        }
        var term = ev.dataTransfer.getData("term");
        var module = ev.dataTransfer.getData("module");
        if (typeof term == "undefined"){
            term = text.substr(i);
        }
        var favs = stringToArray(localStorage.getItem("favs")), found = false;
        $.each(favs, function(i,field){
            if (field == conceptId){
                found = true;
            }
        });
        var concept = {
            defaultTerm: term,
            conceptId: conceptId,
            module: module
        };
        if (!found){
//            console.log(concept);
            favs.push(conceptId);
            localStorage.setItem("favs", favs);
            localStorage.setItem("conceptId:" + conceptId, JSON.stringify(concept));
        }
        channel.publish("favsAction");
    }
}

function dropT(ev, id) {
    $(document).find('.drop-highlighted').removeClass('drop-highlighted');
    ev.preventDefault();
    var text = ev.dataTransfer.getData("Text");
    if (text != "javascript:void(0);") {
        var i = 0;
        while (text.charAt(i) != "|" && i < text.length){
            i++;
        }
        var divElementId = id;
        var panel;
        var conceptId = ev.dataTransfer.getData("concept-id");
        if (typeof conceptId == "undefined" && i < text.length){
            conceptId = text.substr(0, i);
        }
        var term = ev.dataTransfer.getData("term");
        if (typeof term == "undefined"){
            term = text.substr(i);
        }
        var definitionStatus = ev.dataTransfer.getData("def-status");
        var module = ev.dataTransfer.getData("module");

        $.each(componentsRegistry, function (i, field){
            if (field.divElement.id == divElementId){
                panel = field;
            }
        });

        if (conceptId) {
            if (panel.options.selectedView == "undefined") {
                panel.options.selectedView = "inferred";
            }
            if (typeof conceptId != "undefined") {
                var d = new Date();
                var time = d.getTime();
                panel.history.push({term: term, conceptId: conceptId, time: time});
                panel.setToConcept(conceptId, term, definitionStatus, module);
                channel.publish(panel.divElement.id, {
                    term: term,
                    conceptId: conceptId,
                    source: panel.divElement.id
                });
            }
        }
    }
}

function stringToArray (string){
    if (typeof string == "string"){
        var ind = 0, auxString, array = [];
        while (ind < string.length){
            auxString = "";
            while (string.substr(ind, 1) != "," && ind < string.length){
                auxString = auxString + string.substr(ind,1);
                ind++;
            }
            array.push(auxString);
            ind++;
        }
        return(array);
    }else{
        return false;
    }
}

function alertEvent(message, type) {
    $.notify(message,type);
}