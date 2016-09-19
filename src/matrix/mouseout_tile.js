module.exports = function mouseout_tile(params, inst_selection, tip){

  d3.select(inst_selection)
    .classed('hovering',false);

  _.each(['row','col'], function(inst_rc){

    d3.selectAll(params.root+' .'+inst_rc+'_label_group text')
      .style('font-weight','normal');

  });    

  tip.hide();
};