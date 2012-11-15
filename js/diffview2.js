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
			//str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

			// spaceChar
			//if(params.spaceChar) str = str.replace(/^\s+/, function(x) { return x.replace(/\s/g, '<span class="whitechar">'+ params.spaceChar +'</span>'); });
			
			// tabChar
			//if(params.tabChar) str = str.replace(/^\t+/, function(x) { return x.replace(/\t/g, '<span class="whitechar">'+ params.tabChar +'</span>'); });
			
			// newlineChar
			//if(params.newlineChar) str = str.replace(/\r\n/, '<span class="whitechar">'+ params.newlineChar +'</span>\n');
			//if(params.newlineChar) str = str + '<span class="whitechar">'+ params.newlineChar +'</span>';
			
			return str;
		}

		// arrays holding rows
		var rows = Array();
		
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
					row = '<th visiScrollMarker="'+ params.insertColor +'"></th><td class="empty">&nbsp;</td>'; // skip
					row += '<th>'+ parseInt(n+i+1) +'</th><td class="insert">'+ clean_text(newTextLines[n + i]) +'</td>';

					rows.push(row);
				} else if(change == "delete") {
					row = '<th visiScrollMarker="'+ params.deleteColor +'">'+ parseInt(b+i+1) +'</th><td class="delete">'+ clean_text(baseTextLines[b + i]) +'</td>';
					row += '<th></th><td class="empty">&nbsp;</td>'; // skip

					rows.push(row);
				} else if(change == "replace") {
					if(be > b + i) row = '<th visiScrollMarker="'+ params.replaceColor +'">'+ parseInt(b+i+1) +'</th><td class="replace">'+ clean_text(baseTextLines[b + i]) +'</td>';
					else row = '<th visiScrollMarker="'+ params.replaceColor +'"></th><td class="empty">&nbsp;</td>'; // skip

					if(ne > n + i) row += '<th>'+ parseInt(n+i+1) +'</th><td class="replace">'+ clean_text(newTextLines[n + i]) +'</td>';
					else row += '<th></th><td class="empty">&nbsp;</td>'; // skip

					rows.push(row);
				} else if(change == "equal") {
					row = '<th>'+ parseInt(b+i+1) +'</th><td class="equal">'+ clean_text(baseTextLines[b + i]) +'</td>';
					row += '<th>'+ parseInt(n+i+1) +'</th><td class="equal">'+ clean_text(newTextLines[n + i]) +'</td>';

					rows.push(row);
				}	
			}
		} // end for

		// build table
		table = '<table class="diff"><thead><tr><th colspan="2">'+ baseTextName +'</th><th colspan="2">'+ newTextName +'</th></tr></thead>';
		table += '<tbody><tr>' + rows.join('</tr><tr>') + '</tr></tbody></table>';
		
		// css for colors
		css = '<style>table.diff .replace { background-color: '+ params.replaceColor +'; } table.diff .insert { background-color: '+ params.insertColor +'; } table.diff .delete { background-color: '+ params.deleteColor +'; }</style>'

		// return the two table in side-by-side view
		return table + css;

	}
}