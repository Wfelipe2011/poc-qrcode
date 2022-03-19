const html = `
<table class="box">
      <tbody><tr class="col-2">
        <td>
          <label>Nome / Razão Social</label>
          <span>COMERCIAL DE ALIMENTOS CARREFOUR LTDA.</span>
        </td>
        <td>
          <label>Nome Fantasia</label>
          <span></span>
        </td>
      </tr>
      <tr>
        <td>
          <label>CNPJ</label>
          <span>62.545.579/0011-05</span>
        </td>
        <td>
          <label>Endereço</label>
          <span>AV REBOUCAS,&nbsp;
                3970&nbsp;
                </span>
        </td>
      </tr>
      <tr>
        <td>
          <label>Bairro / Distrito</label>
          <span>BUTANTA</span>
        </td>
        <td>
          <label>CEP</label>
          <span>05402-918</span>
        </td>
      </tr>
      <tr>
        <td>
          <label>Município</label>
          <span>3550308
                -
                SAO PAULO</span>
        </td>
        <td>
          <label>Telefone</label>
          <span>
          </span>
        </td>
      </tr>
      <tr>
        <td>
          <label>UF</label>
          <span>SP</span>
        </td>
        <td>
          <label>País</label>
          <span>1058
                    -
                  Brasil</span>
        </td>
      </tr>
      <tr>
        <td>
          <label>Inscrição Estadual</label>
          <span>110146230110</span>
        </td>
        <td>
          <label>Inscrição Estadual do Substituto Tributário</label>
          <span></span>
        </td>
      </tr>
      <tr>
        <td>
          <label>Inscrição Municipal</label>
          <span></span>
        </td>
        <td>
          <label>Município da Ocorrência do Fato Gerador do ICMS</label>
          <span>3550308</span>
        </td>
      </tr>
      <tr>
        <td>
          <label>CNAE Fiscal</label>
          <span></span>
        </td>
        <td>
          <label>Código de Regime Tributário</label>
          <span>
                      3 - Regime Normal
                    </span>
        </td>
      </tr>
    </tbody></table>
`;
//https://pt.stackoverflow.com/questions/180826/como-pegar-uma-string-que-est%C3%A1-entre-tags-com-javascript-utilizando-regex

var regex = /<label>CEP<\/label>\n.+?<span>(.*)<\/span>/;
const result = regex.exec(html)[1];
console.log(result);

let cep = '';
html.replace(
  /<label>CEP<\/label>\n.+?<span>(.*)<\/span>/gm,
  (match, value1) => (cep = value1),
);
console.log(cep);
