import React, { Component } from 'react'; 
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado.js';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado.js';
import PubSub from "pubsub-js"
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {



  constructor(){
    super();
    this.state = {
      nome:'',
      email:'',
      senha:''
    };

    this.enviaForm=this.enviaForm.bind(this);
    this.setNome = this.setNome.bind(this);
    this.setSenha = this.setSenha.bind(this);
    this.setEmail = this.setEmail.bind(this);


  }



  setNome(evento){
    this.setState({nome:evento.target.value});
  }

  setEmail(evento){
    this.setState({email:evento.target.value});
  }

  setSenha(evento){
    this.setState({senha:evento.target.value});
  }

  // sintatic event do React e não evento do DOM
enviaForm(evento){
  evento.preventDefault();
  console.log("dados sendo enviados");
  $.ajax({
    url:'http://localhost:8080/api/autores',
    contentType:'application/json',
    dataType:'json',
    type:'post',
    data:JSON.stringify({nome:this.state.nome,email:this.state.email, senha:this.state.senha}),
    success:function(novaListagem){
      console.log("Enviado com sucesso!");
      // disparar aviso geral de nova listagem disponível
      //publish e subscriber

      PubSub.publish('atualiza-lista-autores',novaListagem);
      this.setState({nome:'', email:'', senha:''});

    }.bind(this)
    // Não precisa mais do bind() pois, com o PubSub, não precisa mais do React neste ponto;
    ,
    error:function(resposta){
      if(resposta.status===400){
        // recuperar quais foram os erros
        // e exibir a mensagem de erro no campo
        new TratadorErros().publicaErros(resposta.responseJSON);
      }
      //console.log(resposta);
      //console.log("Deu erro");
    },
    beforeSend: function() {
      PubSub.publish('limpa-erros', {});
    }
  });
}

  render() {
    return (
       <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">

                  <InputCustomizado id="nome" type="text" label="Nome" name="nome" value={this.state.nome} onChange={this.setNome} />
                  <InputCustomizado id="email" type="text" label="E-Mail" name="email" value={this.state.email} onChange={this.setEmail} />
                  <InputCustomizado id="senha" type="password" label="Senha" name="senha" value={this.state.senha} onChange={this.setSenha} />
                  <BotaoSubmitCustomizado />
                </form>             

              </div>  

      );
  }
}

class TabelaAutores extends Component {


  render(){
    return (
      <div>            
                <table className="pure-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>email</th>
                    </tr>
                  </thead>
                  <tbody>
                    { 
                      this.props.lista.map(function(autor){
                        return (
                          <tr key={autor.id}>
                            <td>{autor.nome}</td>
                            <td>{autor.email}</td>
                          </tr>
                          );
                      })
                    }
                  </tbody>
                </table> 
              </div>          


      );

  }
}
export default class AutorBox extends Component {

// para subir a aplicação, deve se executar o comando
// java  -Dspring.datasource.password=<senha do root do mysql> -jar cdcreact-1.0.0.jar
componentWillMount(){
  console.log("componentWillMount");
  $.ajax({
    url: 'http://localhost:8080/api/autores',
    dataType: 'json',
    success:function(res){
        this.setState({lista:res});
    }.bind(this)
  })
  PubSub.subscribe('atualiza-lista-autores', function(topico, novaListagem){
    this.setState({lista:novaListagem});
  }.bind(this));
}


   constructor(){
    super();
    this.state = {
      lista:[],
    };
   


  }

  render (){
    return (
       <div>
      <div className="header">
          <h1>Cadastro de Autores</h1>
      </div>
      <div className="content" id="content">
        <FormularioAutor  />
        <TabelaAutores lista={this.state.lista} />
              
      </div>
      </div>
      );
  }
}