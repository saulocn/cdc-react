import React, { Component } from 'react'; 
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado.js';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado.js';
import PubSub from "pubsub-js"
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {


  constructor(props){
    super(props);
    this.state = {
      titulo:'',
      preco:'',
      autorId:''
    };

    this.enviaForm=this.enviaForm.bind(this);
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);
  }



  setTitulo(evento){
    this.setState({titulo:evento.target.value});
  }

  setPreco(evento){
    this.setState({preco:evento.target.value});
  }

  setAutorId(evento){
    this.setState({autorId:evento.target.value});
  }

  

  // sintatic event do React e não evento do DOM
enviaForm(evento){
  evento.preventDefault();
  console.log("dados sendo enviados");
  $.ajax({
    url:'http://localhost:8080/api/livros',
    contentType:'application/json',
    dataType:'json',
    type:'post',
    data:JSON.stringify({titulo:this.state.titulo,preco:this.state.preco, autorId:this.state.autorId}),
    success:function(novaListagem){
      console.log("Enviado com sucesso!");
      // disparar aviso geral de nova listagem disponível
      //publish e subscriber

      PubSub.publish('atualiza-lista-livros',novaListagem);
      this.setState({titulo:'', preco:'', autorId:''});

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
     var autores = this.props.autores.map(function(autor){
      return <option key={autor.id} value={autor.id}>{autor.nome}</option>;
    });

    return (
       <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">

                  <InputCustomizado id="titulo" type="text" label="Título" name="titulo" value={this.state.titulo} onChange={this.setTitulo} />
                  <InputCustomizado id="preco" type="text" label="Preço" name="preco" value={this.state.preco} onChange={this.setPreco} />
                  
                  
                  <div className="pure-control-group">
                  <label htmlFor="autorId">Autor</label>
                    <select value={this.state.autorId} id="autorId" name="autorId" onChange={this.setAutorId}> >
                            <option value="">Selecione o Autor</option>

                          {autores}
                          
                      </select>   
                  <span className="error">{this.state.msgErro}</span>
                  </div>     

                  <BotaoSubmitCustomizado />
                </form>             

              </div>  

      );
  }
}

class TabelaLivros extends Component {


  render(){
    return (
      <div>            
                <table className="pure-table">
                  <thead>
                    <tr>
                      <th>TItulo</th>
                      <th>Preço</th>
                      <th>Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    { 
                      this.props.lista.map(function(livro){
                        return (
                          <tr key={livro.id}>
                            <td>{livro.titulo}</td>
                            <td>{livro.preco}</td>
                            <td>{livro.autor.nome}</td>
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

export default class LivroBox extends Component {
  constructor(props) {
    super(props);
    this.state = {lista : [],autores:[]};
  }

  componentDidMount() {
    $.ajax({
      url: "http://localhost:8080/api/livros",
      dataType: 'json',
      success: function(data) {
        this.setState({lista: data});
      }.bind(this)
    });

    $.ajax({
      url: "http://localhost:8080/api/autores",
      dataType: 'json',
      success: function(data) {
        this.setState({autores: data});
      }.bind(this)
    });

    PubSub.subscribe('atualiza-lista-livros', function(topicName,lista){
      this.setState({lista:lista});
    }.bind(this));    
  }


  render() {
    return(
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro autores={this.state.autores}/>
          <TabelaLivros lista={this.state.lista}/>
        </div>
      </div>
    );
  }
}