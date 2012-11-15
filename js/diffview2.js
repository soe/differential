/* rewritten diffview2 - much much faster from ~2x onwards */
diffview2 = {
	/**
	 * Builds and returns a visual diff view.  The single parameter, `params', should contain
	 * the following values:
	 *
	 * - baseTextLines: the array of strings that was used as the base text input to SequenceMatcher
	 * - newTextLines: the array of strings that was used as the new text input to SequenceMatcher
	 * - opcodes: the array of arrays returned by SequenceMatcher.get_opcodes()
	 * - baseTextName: the title to be displayed above the base text listing in the diff view; defaults
	 *	   to "Base Text"
	 * - newTextName: the title to be displayed above the new text listing in the diff view; defaults
	 *	   to "New Text"
	 * - contextSize: the number of lines of context to show around differences; by default, all lines
	 *	   are shown
	 * - viewType: if 0, a side-by-side diff view is generated (default); if 1, an inline diff view is
	 *	   generated
	 */
	buildView: function (params) {
		var baseTextLines = params.baseTextLines;
		var newTextLines = params.newTextLines;
		var opcodes = params.opcodes;

		var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
		var newTextName = params.newTextName ? params.newTextName : "New Text";
		//var contextSize = params.contexttextSize;
		//var inline = (params.viewType == 0 || params.viewType == 1) ? params.viewType : 0;

		if (baseTextLines == null)
			throw "Cannot build diff view; baseTextLines is not defined.";
		if (newTextLines == null)
			throw "Cannot build diff view; newTextLines is not defined.";
		if (!opcodes)
			throw "Cannot build diff view; opcodes is not defined.";

		// escape html characters: &, <, >
		function safe_tags_regex(str) {
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		// arrays holding rows for left hand side and right hand side
		var lhs = Array();
		var rhs = Array();
		
		// loop through opcodes and build the lhs and rhs rows
		for (var idx = 0; idx < opcodes.length; idx++) {
			code = opcodes[idx];
			change = code[0];
			var b = code[1];
			var be = code[2];
			var n = code[3];
			var ne = code[4];
			var rowcnt = Math.max(be - b, ne - n);
			var toprows = [];
			var botrows = [];

			for(var i = 0; i < rowcnt; i++) {
				if(change == "insert") {
					lhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip
					rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="insert">'+ safe_tags_regex(newTextLines[n + i]) +'</td>');
				} else if(change == "delete") {
					lhs.push('<th>'+ parseInt(b+i+1) +'</th><td class="delete">'+ safe_tags_regex(baseTextLines[b + i]) +'</td>');
					rhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip
				} else if(change == "replace") {
					if(be > b + i) lhs.push('<th>'+ parseInt(b+i+1) +'</th><td class="replace">'+ safe_tags_regex(baseTextLines[b + i]) +'</td>');
					else lhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip

					if(ne > n + i) rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="replace">'+ safe_tags_regex(newTextLines[n + i]) +'</td>');
					else rhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip
				} else if(change == "equal") {
					lhs.push('<th>'+ parseInt(b+i+1) +'</th><td class="equal">'+ safe_tags_regex(baseTextLines[b + i]) +'</td>');
					rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="equal">'+ safe_tags_regex(newTextLines[n + i]) +'</td>');
				}	
			}
		} // end for

		lhs_table = '<table class="diff"><thead><th colspan="2">'+ baseTextName +'</th></thead>';
		lhs_table += '<tbody><tr>' + lhs.join('</tr><tr>') + '</tr></tbody></table>';

		rhs_table = '<table class="diff"><thead><th colspan="2">'+ newTextName +'</th></thead>';
		rhs_table = '<tbody><tr>' + rhs.join('</tr><tr>') + '</tr></tbody></table>';

		// return the two table in side-by-side view
		return '<table><tr><td style="vertical-align: top;">'+ lhs_table +'</td><td style="vertical-align: top;">'+ rhs_table +'</tr></table>';

	}
}