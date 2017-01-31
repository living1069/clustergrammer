var find_viz_nodes = require('../zoom/find_viz_nodes');
var make_matrix_rows = require('../matrix/make_matrix_rows');

module.exports = function show_visible_area(params){

  var viz_area = {};
  var zoom_info = params.zoom_info;

  var buffer_size = 5;

  // get translation vector absolute values
  viz_area.min_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x -
                   (buffer_size + 1) * params.viz.rect_width;
  viz_area.min_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y -
                   (buffer_size + 1) * params.viz.rect_height ;

  viz_area.max_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x +
                   params.viz.clust.dim.width/zoom_info.zoom_x +
                   buffer_size * params.viz.rect_width;

  viz_area.max_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y +
                      params.viz.clust.dim.height/zoom_info.zoom_y +
                      buffer_size * params.viz.rect_height ;

  // toggle the downsampling level (if necessary)
  var inst_ds_level;
  if (params.viz.ds === null){
    // no downsampling
    inst_ds_level = -1;
  } else {

    // downsampling
    inst_ds_level = Math.floor(zoom_info.zoom_y / params.viz.ds_zt) ;
    var old_ds_level = params.viz.ds_level;

    if (inst_ds_level > params.viz.ds_num_layers -1 ){
      // this turns off downsampling
      inst_ds_level = -1;
  }
}

  // console.log(inst_ds_level)

  params.viz.ds_level = inst_ds_level;

  // generate lists of visible rows/cols
  find_viz_nodes(params, viz_area);

  // toggle labels and rows
  ///////////////////////////////////////////////
  var severe_toggle = true;
  var normal_toggle = false;
  d3.selectAll(params.root+' .row_label_group')
    .style('display', function(d){
      return toggle_display(params, d, 'row', this, normal_toggle);
    });

  d3.selectAll(params.root+' .row')
    .style('display', function(d){
      return toggle_display(params, d, 'row', this, severe_toggle);
    });

  // toggle col labels
  d3.selectAll(params.root+' .col_label_text')
    .style('display', function(d){
      return toggle_display(params, d, 'col', this, normal_toggle);
    });

  var missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);

  var ds_row_class = '.ds' + String(params.viz.ds_level) + '_row';

  if (inst_ds_level >= 0){
    d3.selectAll('.row').remove();
  }

  // default state for downsampling
  var inst_matrix;

  if (inst_ds_level < 0){
    // set matrix to default matrix
    inst_matrix = params.matrix.matrix;
  } else {
    // set matrix to downsampled matrix
    inst_matrix = params.matrix.ds_matrix[inst_ds_level];
  }

  d3.selectAll('.ds'+String(inst_ds_level)+'_row')
    .each(function(d){
      if (_.contains(params.viz.viz_nodes.row, d.name) === false){
        d3.select(this).remove();
      }
    });


  d3.selectAll(ds_row_class).style('display', 'block');

  // update rows if level changes or if level is -1
  if (inst_ds_level != old_ds_level){

    console.log('ds_level: ' + String(old_ds_level) + ' : '  + String(inst_ds_level))

    // all visible rows are missing at new downsampling level
    missing_rows = params.viz.viz_nodes.row

    // remove old level rows
    d3.selectAll('.ds'+String(old_ds_level)+'_row').remove();

  }

  // only make new matrix rows if there are missing rows
  if (missing_rows.length > 1 || missing_rows === 'all'){
    // make new rows
    make_matrix_rows(params, inst_matrix, missing_rows, inst_ds_level);
  }


  function toggle_display(params, d, inst_rc, inst_selection, severe_toggle=false){
    var inst_display = 'none';

    if (_.contains(params.viz.viz_nodes[inst_rc], d.name)){
      inst_display = 'block';
    } else {

      if (severe_toggle){
        // severe toggle
        d3.select(inst_selection).remove();
      }

    }
    return inst_display;
  }


};