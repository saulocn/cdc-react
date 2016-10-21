import React, {Component} from 'react';
import PubSub from "pubsub-js"

export default class InputCustomizado extends Component{
	constructor(){
		super();
		this.state = {msgErro:''};
	}

	componentDidMount(){
		PubSub.subscribe('erro-validacao', function(topico, erro){
			if(this.props.name===erro.field){
				this.setState({msgErro:erro.defaultMessage});
			}
		}.bind(this));

		PubSub.subscribe('limpa-erros', function(topico){
			this.setState({msgErro:''});
		}.bind(this));
		
	}

	render(){
		return  (
				<div className="pure-control-group">
					<label htmlFor={this.props.id}>{this.props.label}</label> 
					<input id={this.props.id} type={this.props.type} name={this.props.name} value={this.props.value} 
					onChange={this.props.onChange} />   
					<span className="error">{this.state.msgErro}</span>               
				</div>
			);
	}
	
}