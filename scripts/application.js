var page = {
	username: null,
	password: null,
	
	accountNumbers: [],
	outgoingNumberSettings: {},

	init: function() {
		this.bindLoginButton();
		this.bindOptionMenu();
		this.bindOutgoingNumberExtensionSelect();
		this.bindOutgoingNumberClirCheckbox();
		this.bindOutgoingNumberNumberSelect();
		this.bindOutgoingNumberSaveButton();
	},
	
	displayBox: function(box) {
		jQuery.mobile.changePage($("#"+box));
	},
	
	bindLoginButton: function() {
		$('#standardlogin').submit(jQuery.proxy(function() {
			
			this.username = $('#username').val();
			this.password = $('#password').val();
			
			this.request('get','/my/billing/balance/', jQuery.proxy(this.loginResult, this), jQuery.proxy(this.errorHandling, this));
			
			return false;
		}, this));
	},
	
	bindOptionMenu: function() {
		$('.openOption').click(jQuery.proxy(function(e) {
			e.preventDefault();
			var optionElement = e.target;
			var optionName = $(optionElement).attr('href');
			var optionNameMatched = optionName.match(/^#(.*)/);
			if(optionNameMatched == null) {
				return;
			}
			
			this.actionOnClick(optionNameMatched[1]);
						
		}, this));
	},
	
	bindOutgoingNumberExtensionSelect: function() {
		$('#outgoingNumberExtensionSelect').change(jQuery.proxy(function(e) {
			$('.outgoingNumbersSettings').show();
			var chosenExtensionId = e.target.value;
			this.setOutgoingNumberSettings(chosenExtensionId);
		}, this));
	},
	
	bindOutgoingNumberClirCheckbox: function() {
		$('#outgoingNumberClirCheckbox').change(jQuery.proxy(function(e) {
			$('.outgoingNumberSave').show();
			var chosenExtensionId = $('#outgoingNumberExtensionSelect').val();
			if(this.outgoingNumberSettings[chosenExtensionId]) {
				this.outgoingNumberSettings[chosenExtensionId].clip = !$('#outgoingNumberClirCheckbox').prop('checked');
			}
			this.setOutgoingNumberSettings(chosenExtensionId);
		}, this));
	},
		
	bindOutgoingNumberNumberSelect: function() {
		$('#outgoingNumberNumberSelect').change(jQuery.proxy(function(e) {
			$('.outgoingNumberSave').show();
			var chosenNumber = e.target.value;
			if(chosenNumber == "own") {
				$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').fadeIn();
			} else {
				$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').fadeOut();
				$('#outgoingNumberOwnNumberInput').val("");
			} 
		}, this));
	},
	
	bindOutgoingNumberSaveButton: function() {
		$('#outgoingNumberSaveButton').click(jQuery.proxy(function(e) {
			e.preventDefault();
			
			var params = {
				extensionId: $('#outgoingNumberExtensionSelect').val(),
				clip: !$('#outgoingNumberClirCheckbox').prop('checked'),
				number: $('#outgoingNumberNumberSelect').val()
			};
			
			if(params.number == "own") {
				params.number = $('#outgoingNumberOwnNumberInput').val();
			} else {
				params.number = 'tel:' + params.number;
			}
			
			var url = '/my/settings/numbers/outgoing/?'+ $.param(params);
			this.request('post',url, jQuery.proxy(this.outgoingNumberSetResult, this), jQuery.proxy(this.errorHandling, this));
			
		}, this));
	},
	
	setOutgoingNumberSettings: function(extensionId) {
		if(this.outgoingNumberSettings[extensionId]) {
			var extensionSetting = this.outgoingNumberSettings[extensionId];
			if(!extensionSetting.clip) {
				$('#outgoingNumberClirCheckbox').prop('checked', true).checkboxradio("refresh");
				$('#outgoingNumberSettingsList .withClip').fadeOut();
			} else {
				$('#outgoingNumberClirCheckbox').prop('checked', false).checkboxradio("refresh");
				$('#outgoingNumberSettingsList .withClip').fadeIn();
				if(this.accountNumbers.indexOf(extensionSetting.number) !== -1) {
					$('#outgoingNumberNumberSelect').val(extensionSetting.number).selectmenu( "refresh" );
					$('#outgoingNumberOwnNumberInput').val("");
					$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').hide();
				} else {
					$('#outgoingNumberNumberSelect').val("own").selectmenu( "refresh" );
					$('#outgoingNumberOwnNumberInput').val(extensionSetting.prettyNumber);
					$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').show();
				}
			}
		}
	},
	
	actionOnClick: function(clickedOn) {
		if(clickedOn == "outgoingNumber")
		{
			this.request('get','/my/settings/numbers/outgoing/', jQuery.proxy(this.outgoingNumberResult, this), jQuery.proxy(this.errorHandling, this));
		}
		if(clickedOn == "doNotDisturb")
		{
			this.request('get','/my/settings/numbers/outgoing/', jQuery.proxy(this.dndResult, this), jQuery.proxy(this.errorHandling, this));
		}
	},

	outgoingNumberResult: function(data) {
		this.outgoingNumberSettings = {};
		$('.outgoingNumbersSettings').hide();
		$('.withClip').hide();
		$('#outgoingNumberExtensionSelect option').remove();
		$('<option/>').val("").text("Bitte wählen...").appendTo('#outgoingNumberExtensionSelect');
		$.each(data.outgoingNumber.extension, jQuery.proxy(function(key, extensionSetting) {
			this.outgoingNumberSettings[extensionSetting.extension.id] = extensionSetting;
			if(typeof(extensionSetting.extension.alias) == "undefined") return;
			$('<option/>').val(extensionSetting.extension.id).text(extensionSetting.extension.alias).appendTo('#outgoingNumberExtensionSelect');
		},this));
		
		this.displayBox('outgoingNumber');
	},

	outgoingNumberSetResult: function(data, a ,b) {
		console.log(data);
		console.log(a);
		console.log(b);
	},
	
	numbersListResult: function(data) {
		if(data.phonenumbers)
		{
			this.accountNumbers = data.phonenumbers;
			
			$('#outgoingNumberNumberSelect option').remove();
			$('<option/>').val("").text("Bitte wählen...").appendTo('#outgoingNumberNumberSelect');
			$('<option/>').val("own").text("Eigene Rufnummer").appendTo('#outgoingNumberNumberSelect');
			$.each(this.accountNumbers, function(key, number) {
				$('<option/>').val(number).text('+'+number).appendTo('#outgoingNumberNumberSelect');
			});
		}
	},
	
	loginResult: function(data) {
		$('#balance').text("Ihr aktuelles Guthaben: " + data.balance.totalIncludingVat.toFixed(2) + ' ' + data.balance.currency);
		this.request('get', '/my/settings/numbers/list/', jQuery.proxy(this.numbersListResult, this), jQuery.proxy(this.errorHandling, this));
		this.displayBox('options');
	},
	
	dndResult: function(data) {
		$('#doNotDisturbExtensionsList li').remove();
		$.each(data.outgoingNumber.extension, jQuery.proxy(function(key, extensionSetting) {
			if(typeof(extensionSetting.extension.alias) == "undefined") return;
			var slider = this.dndResultCreateNewLineWithSlider("#doNotDisturbExtensionsList", extensionSetting.extension.id, extensionSetting.extension.alias, "false");
			this.dndSliderAddEvent(slider);
		},this));
		
		this.displayBox('doNotDisturb');
	},
	
	dndResultCreateNewLineWithSlider: function(appendTo, extensionId, extensionName, state) {
		if(typeof(extensionName) == "undefined") return;
		var id = 'doNotDisturbExtensionsListLine_'+extensionId;
		var line = $('<li data-role="fieldcontain"></li>').appendTo( appendTo );
		$('<label for="'+id+'">'+extensionName+'</label>').appendTo( line );
		var sliderHTML = '<select name="'+id+'" id="'+id+'" data-extensionId="'+extensionId+'" data-role="slider" data-track-theme="a">';
		sliderHTML += '<option value="false" '+(state=="false" ? 'selected="selected"' : '')+'>Aus</option>';
		sliderHTML += '<option value="true" '+(state=="true" ? 'selected="selected"' : '')+'>An</option>';
		sliderHTML += '</select>';
		return $(sliderHTML).appendTo(line);
	},
	
	dndSliderAddEvent: function(slider) {
		slider.on( "slidestop", jQuery.proxy(function(event) {
			var extensionId = $(event.target).data('extensionid');
			var value = $(event.target).val();
			// console.log("Switch DND for " + extensionId + " to " + value);
			var url = '/my/settings/extensions/'+extensionId+'/dnd/?value='+value;
			this.request('post',url, jQuery.proxy(this.dndSetResult, this), jQuery.proxy(this.errorHandling, this));
		}, this));
	},
	
	dndSetResult: function(data, a ,b) {
		console.log(data);
		console.log(a);
		console.log(b);
	},
	
	errorHandling: function(errorObject, state, errorText)
	{
		if(state == "error" && errorObject.status == 401)
		{
			alert("Die eingegebenen Benutzerdaten sind falsch. Bitte überprüfen Sie Ihre Eingaben.");	
		} else {
			alert("Ein unbekannter Fehler ist aufgetreten:\n" + errorText);
		}
	},
	request: function(method, url, callback, callbackError)
	{
		$.ajax({
			type: 'POST',
			url: 'proxy.php',
			data: {
				url: url,
				username: this.username,
				password: this.password,
				method: method
			},
			success: callback,
			error: callbackError
		});
	}
};

jQuery(document).on("mobileinit", function(){
	  $.mobile.defaultPageTransition = "slide";
	  $.mobile.hashListeningEnabled = false;
});
jQuery(document).ready(function() {
	page.init();
});