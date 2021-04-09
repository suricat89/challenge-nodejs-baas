# Como utilizar a API

1. Setar as variáveis nas **ENVs**
   - **`MONGODB_URI`:** URL de conexão com o BD
   - **`PORT`:** Porta que será utilizada pela API
   - **`ADMIN_USER_PASSWORD`:** Senha que será utilizada na criação do usuário `admin`
   - **`JWT_SECRET`:** Segredo que será utilizado na codificação JWT
   - **`JWT_EXPIRITY_TIME`:** Tempo de expiração do token JWT (expresso em segundos)
2. `npm start`
3. Acessar o **Swagger** da aplicação em `/` ou `/swaggerdoc`
4. Utilizar o endpoint `POST /user/validateAdminUser` para que o usuário `admin` seja criado
5. Criar um cliente no endpoint `POST /customer`
6. Criar um usuário para o cliente no endpoint `POST /user`
7. Realizar login do usuário em `POST /user/login`
   - Anotar o token retornado e utilizá-lo em todas outras chamadas da API no header `x-access-token`

<br>

## Observações

- Eu não conhecia ainda a **API Doc**, então comecei a documentar utilizando ela porém não achei o resultado satisfatório (lista de params fica misturado, atributos pai em alguns casos não ficam logo acima de seus atributos filhos), devido a isso resolvi implementar a documentação com **Swagger (OpenAPI 3)**
- Deixei a **API Doc** gerada dos endpoints de **Cliente** disponível em `/apidoc`
- Documentação da **API Doc** encontra-se nos arquivos `/_apidoc.js` e `/src/routes/customer.doc.js`