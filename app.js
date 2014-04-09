function layOutDay(evts) {
  var $evt = $('#calendar-event-tpl'),
    $cal = $('#calendar-events').clear(),
    groups = group(evts);
  // cycle through each group of colliding events and render them into the calendar
  groups.forEach(function(grp) {
    var cols = [],
      wid;
    grp.evts.forEach(function(evt) {
      // determine the colomn to render into
      var place = 0, matched;
      cols.forEach(function(col, idx) {
        col.forEach(function(e) {
          if (!matched && coincide(evt, e))
            place = idx+1;
        });
        if (place === idx)
          matched = true;
      });
      cols[place] = cols[place] || [];
      cols[place].push(evt);
      $cal.append($evt.render({
        w: wid = 600 / grp.split,
        h: evt.end - evt.start - 14,
        x: 10 + place * wid,
        y: evt.start
      }));
    });
  });
}

// find groups of events sharing the same width
function group(evts) {
  var groups = [{
    start: evts[0].start,
    end: evts[0].end,
    evts: [evts[0]]
  }];
  // match each event pair to find collisions
  evts.slice(1).forEach(function(evt, i) {
    var pushed = false;
    groups.forEach(function(grp) {
      if (!pushed && coincide(evt, grp)) {
        // expand an existing group with this event
        grp.start = Math.min(grp.start, evt.start);
        grp.end = Math.max(grp.end, evt.end);
        grp.evts.push(evt);
        pushed = true;
      }
    });
    if (!pushed) groups.push({
      // create new group with un-collided event
      start: evt.start,
      end: evt.end,
      evts: [evt],
      id: i
    });
  });
  // match each group to determine overlap and filter
  groups = groups.filter(function(grp) {
    groups.forEach(function(g, idx) {
      if (!g.dead && !grp.dead && grp.id !== g.id && coincide(grp, g)) {
        grp.start = Math.min(grp.start, g.start);
        grp.end = Math.max(grp.end, g.end);
        grp.evts = grp.evts.concat(g.evts);
        g.dead = true;
      }
    });
    return !grp.dead;
  });
  // determine widest possible width evts in each group
  groups.forEach(function(grp) {
    var split = 0;
    grp.evts.forEach(function(evt1) {
      evt1.split = 0;
      grp.evts.forEach(function(evt2) {
        if (coincide(evt1, evt2)) evt1.split++;
      });
      split += evt1.split;
    });
    grp.split = Math.floor(split/grp.evts.length);
    // float events to the upper right, with longer events breaking ties
    grp.evts.sort(function(a,b) {
      if (a.start > b.start) return 1;
      if (a.start < b.start) return -1;
      return (a.end > b.end) ? -1 : 1;
    });
  });
  return groups;
}

// determine if two events or groups coincide
function coincide(span1, span2) {
  return (span1.start >= span2.start && span1.start < span2.end || 
    span1.end > span2.start && span1.end <= span2.end ||
    span1.start <= span2.start && span1.end >= span2.end);
}

// DOM selector and template rendering service
function $(selector) {
  var node = (selector.charAt(0) === '#')
    ? document.getElementById(selector.substr(1))
    : document.getElementsClassName(selector.substr(1));
  return {
    append: function(html) {
      node.innerHTML = node.innerHTML+html;
      return this;
    },
    render: function(obj) {
      return node.innerHTML.replace(/\{\{([^}]*)\}\}/g, function(str, match) {
        return obj[match];
      });
      return this;
    },
    clear: function() {
      node.innerHTML = '';
      return this;
    }
  };
}

// render left-hand hour markers
window.addEventListener('load', function () {
  ([9,10,11,12,1,2,3,4,5,6,7,8,9])
    .forEach(function(hr, idx) {
      $('#calendar-time-scale').append($('#calendar-hr-tpl').render({
        time: hr+':00', 
        m: (idx < 3) ? 'AM' : 'PM'
      }));
      if (idx < 12) $('#calendar-time-scale').append($('#calendar-halfhr-tpl').render({
        time: hr+':30'
      }));
    });

  layOutDay([
    {start: 30, end: 150},
    {start: 540, end: 600},
    {start: 560, end: 620},
    {start: 610, end: 670}
  ]);
});