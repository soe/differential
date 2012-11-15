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
	 */
	buildView: function (params) {
		var baseTextLines = params.baseTextLines;
		var newTextLines = params.newTextLines;
		var opcodes = params.opcodes;

		var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
		var newTextName = params.newTextName ? params.newTextName : "New Text";

		if (baseTextLines == null)
			throw "Cannot build diff view; baseTextLines is not defined.";
		if (newTextLines == null)
			throw "Cannot build diff view; newTextLines is not defined.";
		if (!opcodes)
			throw "Cannot build diff view; opcodes is not defined.";

		function clean_text(str) {
			// escape html characters: &, <, >
			str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

			// spaceChar
			if(params.spaceChar) str = str.replace(/^\s+/, function(x) { return x.replace(/\s/g, '<span class="whitechar">'+ params.spaceChar +'</span>'); });
			
			// tabChar
			if(params.tabChar) str = str.replace(/^\t+/, function(x) { return x.replace(/\t/g, '<span class="whitechar">'+ params.tabChar +'</span>'); });
			
			// newlineChar
			if(params.newlineChar) str = str.replace(/\r\n/, '<span class="whitechar">'+ params.newlineChar +'</span>\n');

			return str;
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

					lhs.push('<th visiScrollMarker="'+ params.insertColor +'"></th><td class="empty">&nbsp;</td>'); // skip
					rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="insert">'+ clean_text(newTextLines[n + i]) +'</td>');
				} else if(change == "delete") {
					lhs.push('<th visiScrollMarker="'+ params.deleteColor +'">'+ parseInt(b+i+1) +'</th><td class="delete">'+ clean_text(baseTextLines[b + i]) +'</td>');
					rhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip
				} else if(change == "replace") {
					if(be > b + i) lhs.push('<th visiScrollMarker="'+ params.replaceColor +'">'+ parseInt(b+i+1) +'</th><td class="replace">'+ clean_text(baseTextLines[b + i]) +'</td>');
					else lhs.push('<th visiScrollMarker="'+ params.replaceColor +'"></th><td class="empty">&nbsp;</td>'); // skip

					if(ne > n + i) rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="replace">'+ clean_text(newTextLines[n + i]) +'</td>');
					else rhs.push('<th></th><td class="empty">&nbsp;</td>'); // skip
				} else if(change == "equal") {
					lhs.push('<th>'+ parseInt(b+i+1) +'</th><td class="equal">'+ clean_text(baseTextLines[b + i]) +'</td>');
					rhs.push('<th>'+ parseInt(n+i+1) +'</th><td class="equal">'+ clean_text(newTextLines[n + i]) +'</td>');
				}	
			}
		} // end for

		// build lhs_table
		lhs_table = '<table class="diff"><thead><tr><th colspan="2">'+ baseTextName +'</th></tr></thead>';
		lhs_table += '<tbody><tr>' + lhs.join('</tr><tr>') + '</tr></tbody></table>';

		// build rhs_table
		rhs_table = '<table class="diff"><thead><tr><th colspan="2">'+ newTextName +'</th></tr></thead>';
		rhs_table += '<tbody><tr>' + rhs.join('</tr><tr>') + '</tr></tbody></table>';

		css = '<style>table.diff .replace { background-color: '+ params.replaceColor +'; } table.diff .insert { background-color: '+ params.insertColor +'; } table.diff .delete { background-color: '+ params.deleteColor +'; }</style>'

		// return the two table in side-by-side view
		return '<table><tr><td style="vertical-align: top;">'+ lhs_table +'</td><td style="vertical-align: top;">'+ rhs_table +'</tr></table>'+ css;

	}
}