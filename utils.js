module.exports = {
  /**
  * @param canvas : The canvas object where to draw .
  *                 This object is usually obtained by doing:
  *                 canvas = document.getElementById('canvasId');
  * @param x     :  The x position of the rectangle.
  * @param y     :  The y position of the rectangle.
  * @param w     :  The width of the rectangle.
  * @param h     :  The height of the rectangle.
  * @param text  :  The text we are going to centralize.
  * @param fh    :  The font height (in pixels).
  * @param spl   :  Vertical space between lines
  */
  paint_centered_wrap: function(canvas, x, y, w, h, text, fh, spl) {
    // The painting properties
    // Normally I would write this as an input parameter
    var Paint = {
      RECTANGLE_STROKE_STYLE : 'black',
      RECTANGLE_LINE_WIDTH : 0,
      VALUE_FONT : fh + 'px Arial',
      VALUE_FILL_STYLE : 'red'
    }
    /*
    * @param ctx   : The 2d context
    * @param mw    : The max width of the text accepted
    * @param font  : The font used to draw the text
    * @param text  : The text to be splitted   into
    */
    var split_lines = function(ctx, mw, font, text) {
      // We give a little "padding"
      // This should probably be an input param
      // but for the sake of simplicity we will keep it
      // this way
      mw = mw - 10;
      // We setup the text font to the context (if not already)
      ctx2d.font = font;
      // We split the text by words
      var words = text.split(' ');
      var new_line = words[0];
      var lines = [];
      for(var i = 1; i < words.length; ++i) {
        if (ctx.measureText(new_line + " " + words[i]).width < mw) {
          new_line += " " + words[i];
        } else {
          lines.push(new_line);
          new_line = words[i];
        }
      }
      lines.push(new_line);
      // DEBUG
      // for(var j = 0; j < lines.length; ++j) {
      //    console.log("line[" + j + "]=" + lines[j]);
      // }
      return lines;
    }
    // Obtains the context 2d of the canvas
    // It may return null
    var ctx2d = canvas.getContext('2d');
    if (ctx2d) {
      // Paint text
      var lines = split_lines(ctx2d, w, Paint.VALUE_FONT, text);
      // Block of text height
      var both = lines.length * (fh + spl);
      if (both >= h) {
        // We won't be able to wrap the text inside the area
        // the area is too small. We should inform the user
        // about this in a meaningful way
      } else {
        // We determine the y of the first line
        var ly = (h - both)/2 + y + spl*lines.length;
        var lx = 0;
        for (var j = 0, ly; j < lines.length; ++j, ly+=fh+spl) {
          // We continue to centralize the lines
          lx = x+w/2-ctx2d.measureText(lines[j]).width/2;
          // DEBUG
          ctx2d.fillText(lines[j], lx, ly);
        }
      }
    } else {
      // Do something meaningful
    }
  }
};
