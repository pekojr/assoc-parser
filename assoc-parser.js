class AsssocParser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                #output {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 800px; /* Ajuste este valor para o tamanho desejado */
                    max-height: 400px; /* Ajuste este valor para o tamanho desejado */
                }
            </style>
            <h2>Upload de Arquivo e Conversão para JSON</h2>
            <input type="file" id="fileInput" accept=".txt">
            <pre id="output"></pre>
        `;
    }

    addEventListeners() {
        this.shadowRoot.getElementById("fileInput").addEventListener("change", this.handleFile.bind(this));
    }

    handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            const lines = fileContent.split("\n");

            const records = this.interpretarAtributos(lines);


            const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_file.json';
            a.click();

            URL.revokeObjectURL(url);

            this.shadowRoot.getElementById("output").textContent = JSON.stringify(records, null, 2);
        };

        reader.readAsText(file);

    }

    interpretarAtributos(arrayDeEntrada) {
        const resultado = [];
        let fisio = null;

        for (const item of arrayDeEntrada) {
            const partes = item.split(" ");
            const atributosItem = {};

            try {
                const codigo = partes.shift();
                if (!isNaN(codigo)) {
                    atributosItem["código"] = parseInt(codigo);
                    atributosItem["fisio"] = fisio;
                } else {
                    fisio = codigo.trim();
                    continue;
                }

                let nomeCompleto = "";
                while (partes.length > 0) {
                    const parte = partes.shift();
                    if (parte.match(/[a-zA-Z]/)) {
                        nomeCompleto += parte + " ";
                    } else {
                        partes.unshift(parte);
                        break; // Sai do loop quando encontrar um valor não alfabético
                    }
                }
                atributosItem["nome completo"] = nomeCompleto.trim();

                atributosItem["data"] = partes.shift();
                atributosItem["hora"] = partes.shift();
                atributosItem["número1"] = parseInt(partes.shift());
                atributosItem["número2"] = parseInt(partes.shift());
                atributosItem["valor1"] = parseFloat(partes.shift().replace(",", "."));
                atributosItem["valor2"] = parseFloat(partes.shift().replace(",", "."));
                atributosItem["valor3"] = parseFloat(partes.shift().replace(",", "."));
            } catch (error) {
                atributosItem["desconhecido"] = item;
            }

            resultado.push(atributosItem);
        }

        return resultado;

    }
}
export default AsssocParser;
