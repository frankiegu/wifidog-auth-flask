jQuery(function($) {
	function update(top) {
		var $checkboxes = $('.flakes-table tbody :checkbox'),
			$checked = $('.flakes-table tbody :checkbox:checked');

		$('.flakes-actions-bar :checkbox').prop('checked', $checkboxes.length > 0 && $checkboxes.length == $checked.length);

		$('.flakes-actions-bar .action').prop('disabled', $checked.length == 0);
	}

	$('<input style="margin: 20px 10px;" type="checkbox">')
		.prependTo('.flakes-actions-bar')
		.on('click', function() {
			var isChecked = $(this).is(':checked');
			$(this).closest('form').find('.flakes-table tbody :checkbox').prop('checked', isChecked);
			update();
		});

	$('.flakes-table tbody :checkbox').on('click', function() {
		update();
	});

	$('#network').change(function() {
		var network = $(this).val(),
			gateway = $('#gateway').val();

		if (network == '__None') {
			$('#gateway')
				.val('__None')
				.find('option[value!="__None"]').prop('disabled', true).hide();
			$('#roles option:contains("super-admin")').prop('disabled', false);
		} else {
			$('#gateway')
				.find('option[data-network!="' + network + '"]').prop('disabled', true).hide().end()
				.find('option[data-network="' + network + '"], option[value="__None"]').prop('disabled', false).show().end();

			if ($('#gateway option:enabled[value="' + gateway + '"]').length) {
				$('#gateway').val(gateway);
			} else {
				$('#gateway').val('__None');
			}

			$('#roles option:contains("super-admin")').prop('disabled', true);
		}
	}).change();

	$('#gateway').change(function() {
		var gateway = $(this).val();

		if (gateway == '__None') {
			$('#roles option:contains("network-admin")').prop('disabled', false);
		} else {
			$('#roles option:contains("network-admin")').prop('disabled', true);
		}
	}).change();

	update();
});
