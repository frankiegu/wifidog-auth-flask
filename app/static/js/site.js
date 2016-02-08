jQuery(function($) {
	function update() {
		var $checkboxes = $('.flakes-table tbody :checkbox'),
			$checked = $('.flakes-table tbody :checkbox:checked');

		$('.flakes-actions-bar :checkbox').prop('checked', $checkboxes.length == $checked.length);
		$('.flakes-actions-bar .action').prop('disabled', $checked.length == 0);
	}

	$('<input style="margin: 20px 10px;" type="checkbox">')
		.prependTo('.flakes-actions-bar')
		.on('click', function() {
			var isChecked = $(this).is(':checked');
			$(this).closest('form').find('.flakes-table tbody :checkbox').prop('checked', isChecked);
			update();
		});

	$('.flakes-table :checkbox').on('click', update);

	update();
});
