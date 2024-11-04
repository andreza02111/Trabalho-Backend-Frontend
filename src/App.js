import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';

function App() {
    const [rating, setRating] = useState(0);
    const [opinion, setOpinion] = useState('');
    
    const Avaliacao = ({ company, rating, setRating, opinion, setOpinion, setView }) => {
        const textareaRef = useRef(null);
      
        const handleOpinionChange = (e) => {
          setOpinion(e.target.value);
        };
      
        useEffect(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
          }
        }, [opinion]);
      
        const handleSubmit = () => {
          const avaliacao = {
            rating,
            opinion,
            username: company.username,
            nome: company.nome,
          };
      
          // Salva a avaliação no localStorage
          localStorage.setItem(`avaliacao_${company.username}`, JSON.stringify(avaliacao));
      
          console.log('Avaliação enviada:', avaliacao);
          setRating(0); // Limpa a avaliação
          setOpinion(''); // Limpa a opinião
          setView('viewCompanies');
        };
      
        return (
          <div className='login-container'>
            <h2>Avaliação da Empresa</h2>
          <strong>Nome:</strong> {company.nome}
            <StarRating rating={rating} setRating={setRating} />
            <textarea
              ref={textareaRef}
              value={opinion}
              onChange={handleOpinionChange}
              placeholder="Deixe sua opinião"
              rows="4"
              cols="50"
            />
            <br />
            <button onClick={handleSubmit}>Enviar Avaliação</button>
            <button onClick={() => setView('viewCompanies')}>Voltar</button>
          </div>
        );
      };
      
  
    const [selectedCompany, setSelectedCompany] = useState(null);
    const handleCompanyClick = (company) => {
        setSelectedCompany(company);
        setView('avaliacao');
      };
      const StarRating = ({ rating, setRating, size = '25px' }) => {
        const handleStarClick = (index) => {
          setRating(index + 1);
        };
      
        return (
          <div>
            {[...Array(5)].map((star, index) => (
              <span
                key={index}
                onClick={() => handleStarClick(index)}
                style={{ cursor: 'pointer', color: index < rating ? 'gold' : 'gray', fontSize: size }}
              >
                ★
              </span>
            ))}
          </div>
        );
      };
      
      
      const StarDisplay = ({ rating }) => {
        return (
          <div>
            {[...Array(5)].map((star, index) => (
              <span key={index} style={{ color: index < rating ? 'gold' : 'gray' }}>
                ★
              </span>
            ))}
          </div>
        );
      };
      
      
    const [companies, setCompanies] = useState([]); // Novo estado para armazenar as empresas
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ name: '', description: '', image: '', price: '' });
    const [editingProject, setEditingProject] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [registerForm, setRegisterForm] = useState({
        imagem: '',
        nome: '',
        username: '',
        password: '',
        cnpj: '',
        inscricaoEstadual: '',
        tipoEmpresa: '',
        dataAbertura: '',
        naturezaJuridica: '',
        atividadePrincipal: '',
        endereco: '',
        telefone: '',
        email: '',
        socioNome: '',
        socioCpf: '',
        socioDataNascimento: '',
        socioCargo: '',
        socioTelefone: '',
        socioEmail: ''
    });
    const [currentUser, setCurrentUser] = useState(null);

    const [view, setView] = useState('viewCompanies');

    const handleRegister = (e) => {
        e.preventDefault();
        const { username } = registerForm;
        const existingUser = JSON.parse(localStorage.getItem(username));
    
        if (existingUser) {
            alert('Usuário já existe');
        } else {
            localStorage.setItem(username, JSON.stringify(registerForm));
            setSuccessMessage('Usuário registrado com sucesso!');
            setIsRegistering(false);
            setView('login'); // Redireciona para a página de login
        }
    };
    
    

    const handleLogin = (e) => {
        e.preventDefault();
        const { username, password } = loginForm;
        const storedUser = JSON.parse(localStorage.getItem(username));
        if (storedUser && storedUser.password === password) {
            setIsAuthenticated(true);
            setCurrentUser(storedUser);
            setView('index_empresa');
        } else {
            alert('Credenciais inválidas');
        }
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prevState => ({ ...prevState, [name]: value }));
    };
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('http://localhost:5000/projects')
                .then(response => {
                    // Filtra os projetos para mostrar apenas os da empresa autenticada
                    const userProjects = response.data.filter(project => project.createdBy === currentUser.username);
                    setProjects(userProjects);
                })
                .catch(error => console.error('Erro ao buscar projetos:', error));
        }
    }, [isAuthenticated, currentUser]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddProject = () => {
        axios.post('http://localhost:5000/projects', newProject)
            .then(response => {
                setProjects([...projects, { ...newProject, _id: response.data }]);
                setNewProject({ name: '', description: '', image: '', price: '' });
                setView('viewProducts'); // Voltar para a lista após adicionar
            })
            .catch(error => console.error('Erro ao adicionar projeto:', error));
    };

      
    const handleDeleteProject = (projectId) => {
        axios.delete(`http://localhost:5000/projects/${projectId}`)
            .then(response => {
                setProjects(projects.filter(project => project._id !== projectId));
            })
            .catch(error => console.error('Erro ao deletar projeto:', error));
    };

    const handleEditProject = (project) => {
        setEditingProject(project._id);
        setNewProject({ name: project.name, description: project.description, image: project.image, price: project.price });
        setView('addProduct'); // Alterna para o formulário de adição/edição
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegisterForm(prevState => ({
                    ...prevState,
                    imagem: reader.result // Armazena a string base64
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    
    const handleUpdateProject = () => {
        axios.put(`http://localhost:5000/projects/${editingProject}`, newProject)
            .then(response => {
                setProjects(projects.map(project => (
                    project._id === editingProject ? { ...project, ...newProject } : project
                )));
                setEditingProject(null);
                setNewProject({ name: '', description: '', image: '', price: '' });
                setView('viewProducts'); // Voltar para a lista após editar
            })
            .catch(error => console.error('Erro ao atualizar projeto:', error));
    };

    useEffect(() => {
        const storedCompanies = Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key)));
        setCompanies(storedCompanies);
    }, []);
    useEffect(() => {
        const storedCompanies = Object.keys(localStorage).map(key => {
          if (key.startsWith('avaliacao_')) return null; // Ignora as chaves de avaliações
          const company = JSON.parse(localStorage.getItem(key));
          const avaliacao = JSON.parse(localStorage.getItem(`avaliacao_${company.username}`));
          return { ...company, avaliacao };
        }).filter(company => company !== null); // Remove os valores nulos
        setCompanies(storedCompanies);
      }, []);
      
    return (
        <div>
            <nav className="navbar">
                <ul className="navbar-list">
                    {!isAuthenticated ? (
                        <>
                            <li className="navbar-item" onClick={() => setView('viewCompanies')}>Home</li>
                            <li className="navbar-item" onClick={() => setView('contacts')}>Contatos</li>
                            <li className="navbar-item" onClick={() => setView('login')}>Login</li>
                        </>
                    ) : (
                        <>
                           <li className="navbar-item" onClick={() => setView('index_empresa')}>Início</li>
                            <li className="navbar-item" onClick={() => setView('viewProducts')}>Meus Produtos</li>
                            <li className="navbar-item" onClick={() => setView('addProduct')}>Adicionar Produtos</li>
                            <li className="navbar-item" onClick={() => setView('myData')}>Meus Dados</li>
                            <li className="navbar-item" onClick={() => { setIsAuthenticated(false); setView('viewCompanies'); }}>Logout</li>
                        </>
                    )}
                </ul>
            </nav>

    <div className="banner">
        <img src="https://github.com/andreza02111/Imagens--trabalho/blob/Python/imagem2.png?raw=true" alt="Banner" />
    </div>
    {!isAuthenticated && view === 'viewCompanies' && (
  <div>
    <h2 className='tituloEmpresas'>Lista de Empresas Registradas</h2>
    <ul className="company-list">
      {companies.map(company => (
        <li key={company.nome} className="company-item" onClick={() => handleCompanyClick(company)} style={{ cursor: 'pointer' }}>
          <img src={company.imagem} alt={company.nome} className="company-image" />
          <div className="company-details">
            <h3>{company.nome}</h3>
            <h4>{company.tipoEmpresa}</h4>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

{view === 'avaliacao' && selectedCompany && (
  <Avaliacao
    company={selectedCompany}
    rating={rating}
    setRating={setRating}
    opinion={opinion}
    setOpinion={setOpinion}
    setView={setView}
  />
)}



        {!isAuthenticated && view === 'login' && (
            <div className="login-container">
                <h2>Login</h2>
                {successMessage && <p>{successMessage}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        className="input_login"
                        type="text"
                        name="username"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        placeholder="Usuário"
                        required
                    />
                    <br />
                    <input
                        className="input_login"
                        type="password"
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Senha"
                        required
                    />
                    <br />
                    <button type="submit">Login</button>
                    <button type="button" onClick={() => setView('cadastro')}>Cadastre-se</button>
                    <button type="button" onClick={() => setView('viewCompanies')}>Voltar</button>
                </form>
            </div>
        )}
 {view === 'myData' && isAuthenticated && currentUser && (
                <div className= "meus_dados">
                    <h2>Meus Dados</h2>
                    <div>
                        <h3>Empresa</h3>
                        <img src={currentUser.imagem} alt={currentUser.nome}/>
                        <p><strong>Nome:</strong> {currentUser.nome}</p>
                        <p><strong>Usuário:</strong> {currentUser.username}</p>
                        <p><strong>CNPJ:</strong> {currentUser.cnpj}</p>
                        <p><strong>Inscrição Estadual:</strong> {currentUser.inscricaoEstadual}</p>
                        <p><strong>Tipo de Empresa:</strong> {currentUser.tipoEmpresa}</p>
                        <p><strong>Data de Abertura:</strong> {currentUser.dataAbertura}</p>
                        <p><strong>Natureza Jurídica:</strong> {currentUser.naturezaJuridica}</p>
                        <p><strong>Atividade Principal:</strong> {currentUser.atividadePrincipal}</p>
                        <p><strong>Endereço:</strong> {currentUser.endereco}</p>
                        <p><strong>Telefone:</strong> {currentUser.telefone}</p>
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <h3>Sócio Proprietário</h3>
                        <p><strong>Nome:</strong> {currentUser.socioNome}</p>
                        <p><strong>CPF:</strong> {currentUser.socioCpf}</p>
                        <p><strong>Data de Nascimento:</strong> {currentUser.socioDataNascimento}</p>
                        <p><strong>Cargo:</strong> {currentUser.socioCargo}</p>
                        <p><strong>Telefone:</strong> {currentUser.socioTelefone}</p>
                        <p><strong>Email:</strong> {currentUser.socioEmail}</p>
                    </div>
                </div>
            )}
        {!isAuthenticated && view === 'cadastro' && (
            <div className="cadastro-container">
                <h2>Cadastro Empresa</h2>
                <form onSubmit={handleRegister}>
                    <input
                        className="input_cadastro"
                        type="file"
                        name="imagem"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="nome"
                        value={registerForm.nome}
                        onChange={handleRegisterChange}
                        placeholder="Nome Empresa"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="username"
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                        placeholder="Usuário"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        placeholder="Senha"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="cnpj"
                        value={registerForm.cnpj}
                        onChange={handleRegisterChange}
                        placeholder="CNPJ"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="inscricaoEstadual"
                        value={registerForm.inscricaoEstadual}
                        onChange={handleRegisterChange}
                        placeholder="Inscrição Estadual"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="tipoEmpresa"
                        value={registerForm.tipoEmpresa}
                        onChange={handleRegisterChange}
                        placeholder="Tipo de Empresa"
                    />
                    <br />
                    <label htmlFor="dataAbertura">Data de abertura:</label>
                    <input
                        className="input_cadastro"
                      
                        type="date"
                        name="dataAbertura"
                        value={registerForm.dataAbertura}
                        onChange={handleRegisterChange}
                        placeholder="Data de Abertura"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="naturezaJuridica"
                        value={registerForm.naturezaJuridica}
                        onChange={handleRegisterChange}
                        placeholder="Natureza Jurídica"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="atividadePrincipal"
                        value={registerForm.atividadePrincipal}
                        onChange={handleRegisterChange}
                        placeholder="Atividade Principal"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="endereco"
                        value={registerForm.endereco}
                        onChange={handleRegisterChange}
                        placeholder="Endereço"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="telefone"
                        value={registerForm.telefone}
                        onChange={handleRegisterChange}
                        placeholder="Telefone"
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        placeholder="E-mail"
                        required
                    />
                    <br />
                    <h3>Sócio Proprietário</h3>
                    <input
                        className="input_cadastro"
                        type="text"
                        name="socioNome"
                        value={registerForm.socioNome}
                        onChange={handleRegisterChange}
                        placeholder="Nome do Sócio"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="socioCpf"
                        value={registerForm.socioCpf}
                        onChange={handleRegisterChange}
                        placeholder="CPF do Sócio"
                        required
                    />
                    <br />
                    <label htmlFor="socioDataNascimento">Data de Nascimento:</label>
                    <input
                        className="input_cadastro"
                        type="date"
                        name="socioDataNascimento"
                        value={registerForm.socioDataNascimento}
                        onChange={handleRegisterChange}
                        placeholder="Data de Nascimento do Sócio"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="socioCargo"
                        value={registerForm.socioCargo}
                        onChange={handleRegisterChange}
                        placeholder="Cargo do Sócio"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="text"
                        name="socioTelefone"
                        value={registerForm.socioTelefone}
                        onChange={handleRegisterChange}
                        placeholder="Telefone do Sócio"
                        required
                    />
                    <br />
                    <input
                        className="input_cadastro"
                        type="email"
                        name="socioEmail"
                        value={registerForm.socioEmail}
                        onChange={handleRegisterChange}
                        placeholder="E-mail do Sócio"
                        required
                    />
                    <br />
                    <button type="submit">Registrar</button>
                    <button type="button" onClick={() => setView('login')}>Voltar</button>
                </form>
            </div>
        )}

{view === 'viewProducts' && (
                <section id="projectList">
                    <button onClick={() => setView('addProduct')}>Adicionar Produtos</button>
                    <h2>Lista de Produtos</h2>
                    {projects.length === 0 ? (
                        <p>Nenhum produto foi adicionado ainda.</p>
                    ) : (
                        <div className="product-list">
                            {projects.map((project, index) => (
                                <div className="product-item" key={index}>
                                    <strong>Nome:</strong> {project.name} <br />
                                    <strong>Descrição:</strong> {project.description} <br />
                                    <strong>Imagem:</strong> <img src={project.image} alt={project.name} width="100"  /> <br />
                                    <strong>Preço:</strong> {project.price} <br />
                                    <button onClick={() => handleEditProject(project)}>Editar</button>
                                    <button onClick={() => handleDeleteProject(project._id)}>Deletar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
{view === 'index_empresa' && (
  <section id="projectList" className="index_empresas">
    <h2>Meus Produtos</h2>
    {projects.length === 0 ? (
      <p>Nenhum produto foi adicionado ainda.</p>
    ) : (
      <div className="product-list">
        {projects.map((project, index) => (
          <div className="product-item" key={index}>
            <strong>{index + 1}. Nome:</strong> {project.name} <br />
            <strong>Descrição:</strong> {project.description} <br />
            <strong>Imagem:</strong> <img src={project.image} alt={project.name} width="100" /> <br />
            <strong>Preço:</strong> {project.price} <br />
            <button onClick={() => handleEditProject(project)}>Editar</button>
            <button onClick={() => handleDeleteProject(project._id)}>Deletar</button>
          </div>
        ))}
      </div>
    )}
    <div >
    <h3>Avaliações</h3>
    {companies.find(company => company.username === currentUser.username)?.avaliacao ? (
      <div className="avaliacao">
        <strong >Avaliação:</strong> <StarDisplay rating={companies.find(company => company.username === currentUser.username).avaliacao.rating} /> <br />
       <strong >Opinião:</strong> {companies.find(company => company.username === currentUser.username).avaliacao.opinion} <br />
      </div>
    ) : (
      <p>Nenhuma avaliação encontrada.</p>
    )}
    </div>
  </section>
)}


            {view === 'addProduct' && (
                <section id="addProject"  className='login-container'>
                    <h2>{editingProject ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                    <form onSubmit={(e) => { e.preventDefault(); editingProject ? handleUpdateProject() : handleAddProject(); }}>
                        <input className="input_login"
                            type="text"
                            name="name"
                            value={newProject.name}
                            onChange={handleInputChange}
                            placeholder="Nome do Produto"
                            required
                        />
                        <br />
                        <input className="input_login"
                            type="text"
                            name="description"
                            value={newProject.description}
                            onChange={handleInputChange}
                            placeholder="Descrição"
                            required
                        />
                        <br />
                        <input className="input_login"
                            type="text"
                            name="image"
                            value={newProject.image}
                            onChange={handleInputChange}
                            placeholder="URL da Imagem"
                            required
                        />
                        <br />
                        <input className="input_login"
                            type="text"
                            name="price"
                            value={newProject.price}
                            onChange={handleInputChange}
                            placeholder="Preço"
                            required
                        />
                        <br />
                        <button type="submit">{editingProject ? 'Atualizar Produto' : 'Adicionar Produto'}</button>
                        <button onClick={() => setView('viewProducts')}>Voltar para Lista de Produtos</button>
                    </form>
                   
                  
                </section>

        )}
    </div>
);
}
export default App;