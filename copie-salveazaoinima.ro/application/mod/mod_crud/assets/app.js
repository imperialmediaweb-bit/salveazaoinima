function crudRowSelected(e) {
	 
	var m = jQuery(e).attr('data-model');
	crudRowSelectToggleMenu(m);
}

function crudRowSelectedIds(m) {
	var c = 'rowSelect-' + m;
	var checked = jQuery('.' +c+":checked");
	var ids = [];
	 
	if (checked.length > 0) {
		checked.each(function(k, v) {
			ids[k]=jQuery(v).attr('data-id');
		});
	}
	
	return ids;
}

function crudRowSelectedToggle(m) {
	var c = 'rowSelect-' + m;
	jQuery('.' + c).prop("checked", jQuery('#' + c).prop("checked")).trigger('change');
	crudRowSelectToggleMenu(m);
}

function crudRowSelectToggleMenu(m) {
	var c = 'rowSelectMenu-' + m;
	var c1 = 'rowSelect-' + m;
	var count = jQuery("." + c1 + ":checked").length;
	jQuery("." + c + '-count').html(count);
	if (count > 0) {
		jQuery("." + c).show();
		jQuery("." + c).show();
	} else {
		jQuery("." + c).hide();
		jQuery("." + c).hide();
	}
}

var backdropPanelEdit = {
    add: function (model, modelId, containerModel, containerModelId) {
    if(!$('body').hasClass('framework6')){ return;}
        if ($('#' + containerModel + '-' + containerModelId + '-panel-edit-backdrop').length !== 1) {
            let panel = $("#" + containerModel + "-" + containerModelId + "-panel-edit > div");
            let classBackdrop = "card";
            if (panel.length === 0) {
                if ($('#' + model + '-' + modelId + '-panel-edit').closest('#modal').length > 0) {
                    panel = $('#modal');
                    classBackdrop = "";
                }
            }

            let background = 'rgba(0, 0, 0, 0.2)';
            if ($('body').hasClass('dark-version')) {
                background = 'rgba(255, 255, 255, 0.3) !important';
            }
            panel.prepend('<div id="' + containerModel + '-' + containerModelId + '-panel-edit-backdrop" class="' + classBackdrop + ' crud-backdrop-active" style="position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: ' + background + '; z-index: 9;"></div>');
        }

        $('#' + model + '-' + modelId + '-panel-edit').css('z-index', 10);
    },
    remove: function (containerModel, containerModelId) {
        $('#' + containerModel + '-' + containerModelId + '-panel-edit-backdrop').remove();
        /*$("#" + containerModel + "-" + containerModelId + "-panel-edit .card-header").css('background', '#fff');*/
    },
    clear: function (containerModel, containerModelId) {
        $('.crud-backdrop-active').remove();
    }
}

