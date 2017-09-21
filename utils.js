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
    var Paint = {
      RECTANGLE_STROKE_STYLE : 'black',
      RECTANGLE_LINE_WIDTH : 0,
      VALUE_FONT : fh + 'px Arial Black',
      VALUE_FILL_STYLE : 'red'
    }
    var split_lines = function(ctx, mw, font, text1) {
      mw = mw - 10;
      ctx2d.font = font;
      var text = text1.toUpperCase();
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
      return lines;
    }
    var ctx2d = canvas.getContext('2d');
    if (ctx2d) {
      var lines = split_lines(ctx2d, w, Paint.VALUE_FONT, text);
      var both = lines.length * (fh + spl);
      if (both >= h) {
        // AREA TWO SMALL
      } else {
        var ly = (h - both)/2 + y + spl*lines.length;
        var lx = 0;
        for (var j = 0, ly; j < lines.length; ++j, ly+=fh+spl) {
          lx = x+w/2-ctx2d.measureText(lines[j]).width/2;
          ctx2d.fillText(lines[j], lx, ly);
        }
      }
    } else {
      // Do something meaningful
    }
  }
};
