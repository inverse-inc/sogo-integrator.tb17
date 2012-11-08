function jsInclude(files, target) {
    let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    for (let i = 0; i < files.length; i++) {
        try {
            loader.loadSubScript(files[i], target);
        }
        catch(e) {
            dump("folder-handler.js: failed to include '" + files[i] + "'\n" + e +
                 "\nFile: " + e.fileName +
                 "\nLine: " + e.lineNumber + "\n\n Stack:\n\n" + e.stack);
        }
    }
}

jsInclude(["chrome://inverse-library/content/sogoWebDAV.js",
           "chrome://sogo-integrator/content/addressbook/categories.js",
           "chrome://sogo-integrator/content/calendar/default-classifications.js"]);
let gSICategoriesChanged = false;
let gSIDefaultClassificationsChanged = false;

function SIPrefsOnLoad() {
    /* contacts categories */
    let SIgSOGoConnectorPane_addCategory_old = gSOGoConnectorPane.contactCategoriesPane._addCategory;
    let SIgSOGoConnectorPane_editCategory_old = gSOGoConnectorPane.contactCategoriesPane._editCategory;
    let SIgSOGoConnectorPaneonDeleteCategory_old = gSOGoConnectorPane.contactCategoriesPane.onDeleteCategory;

    function SIgSOGoConnectorPane_addCategory(newName) {
        SIgSOGoConnectorPane_addCategory_old.apply(gSOGoConnectorPane.contactCategoriesPane, arguments);
        if (newName && newName.length > 0) {
            gSICategoriesChanged = true;
        }
    }

    function SIgSOGoConnectorPane_editCategory(idx, newName) {
        SIgSOGoConnectorPane_editCategory_old.apply(gSOGoConnectorPane.contactCategoriesPane, arguments);
        gSICategoriesChanged = true;
    }

    function SIgSOGoConnectorPaneonDeleteCategory() {
        let list = document.getElementById("SOGoConnectorContactCategoriesList");
        if (list.selectedCount > 0) {
            gSICategoriesChanged = true;
        }
        SIgSOGoConnectorPaneonDeleteCategory_old.apply(gSOGoConnectorPane.contactCategoriesPane, arguments);
    }

    gSOGoConnectorPane.contactCategoriesPane._addCategory = SIgSOGoConnectorPane_addCategory;
    gSOGoConnectorPane.contactCategoriesPane._editCategory = SIgSOGoConnectorPane_editCategory;
    gSOGoConnectorPane.contactCategoriesPane.onDeleteCategory = SIgSOGoConnectorPaneonDeleteCategory;

    /* calendar classifications */
    let classChangeListener = function(event) {
        gSIDefaultClassificationsChanged = true;
    };
    for each (let branchName in [ "events", "todos" ]) {
        let pref = document.getElementById("calendar." + branchName + ".default-classification");
        pref.addEventListener("change", classChangeListener, false);
    }
}

function SIPrefsOnUnload() {
    if (gSICategoriesChanged) {
        SIContactCategories.synchronizeToServer();
    }
    if (gSIDefaultClassificationsChanged) {
        SICalendarDefaultClassifications.synchronizeToServer();
    }
}

window.addEventListener("load", SIPrefsOnLoad, false);
window.addEventListener("unload", SIPrefsOnUnload, false);
