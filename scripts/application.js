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
		this.bindOutgoingNumberOwnNumberInput();
		this.bindOutgoingNumberNumberSelect();
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
			var chosenExtensionId = $('#outgoingNumberExtensionSelect').val();
			if(this.outgoingNumberSettings[chosenExtensionId]) {
				this.outgoingNumberSettings[chosenExtensionId].clip = !$('#outgoingNumberClirCheckbox').prop('checked');
			}
			this.setOutgoingNumberSettings(chosenExtensionId);
		}, this));
	},
	
	bindOutgoingNumberOwnNumberInput: function() {
		$('#outgoingNumberClirCheckbox').change(jQuery.proxy(function(e) {
			$('#outgoingNumberNumberSelect').val("own").selectmenu( "refresh" );
		}, this));
	},
	
	bindOutgoingNumberNumberSelect: function() {
		$('#outgoingNumberNumberSelect').change(jQuery.proxy(function(e) {
			var chosenNumber = e.target.value;
			if(chosenNumber == "own") {
				$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').fadeIn();
			} else {
				$('#outgoingNumberSettingsList .outgoingNumberOwnNumber').fadeOut();
				$('#outgoingNumberOwnNumberInput').val("");
			} 
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
	
	numbersListResult: function(data) {
		if(data.phonenumbers)
		{
			this.accountNumbers = data.phonenumbers;
			
			$('#outgoingNumberNumberSelect option').remove();
			$('<option/>').val("").text("Bitte wählen...").appendTo('#outgoingNumberNumberSelect');
			$('<option/>').val("own").text("Eigene Rufnummer").appendTo('#outgoingNumberNumberSelect');
			$.each(this.accountNumbers, function(key, number) {
				$('<option/>').val(number).text(number).appendTo('#outgoingNumberNumberSelect');
			});
		}
	},
	
	loginResult: function(data) {
		$('#balance').text("Ihr aktuelles Guthaben: " + data.balance.totalIncludingVat.toFixed(2) + ' ' + data.balance.currency);
		this.request('get', '/my/settings/numbers/list/', jQuery.proxy(this.numbersListResult, this), jQuery.proxy(this.errorHandling, this));
		this.displayBox('options');
	},
	
	errorHandling: function(errorObject, state, errorText)
	{
		if(state == "error" && errorObject.status == 401)
		{
			alert("Die eingegebenen Benutzerdaten sind falsch. Bitte überprüfen Sie Ihre Eingaben.");	
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