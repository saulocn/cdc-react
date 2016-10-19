import React, {Component} from 'react';

export default class BotaoSubmitCustomizado  extends Component{
	render(){
		return  (
                  <div className="pure-control-group">                                  
                    <label></label> 
                    <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
                  </div>
			);
	}
	
}