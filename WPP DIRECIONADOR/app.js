function formatNumber(rawNumber) {
    let number = rawNumber.replace(/\D/g, '');
    if (number.length === 10 || number.length === 11) {
        number = '55' + number;
    }
    return number;
}

function extractSmartData(text) {
    let phone = "";
    let companyName = "sua construtora";

    const phoneRegex = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}/;
    const fallbackRegex = /\d[ \d\-\(\)]{8,}\d/;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let phoneLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const phoneMatch = line.match(phoneRegex);
        if (phoneMatch) {
            phone = formatNumber(phoneMatch[0]);
            phoneLineIndex = i;
            break;
        }
        const fallbackMatch = line.match(fallbackRegex);
        if (fallbackMatch) {
            phone = formatNumber(fallbackMatch[0]);
            phoneLineIndex = i;
            break;
        }
    }

    if (lines.length > 0) {
        if (lines.length === 1) {
            let textWithoutPhone = lines[0].replace(phoneRegex, '').replace(fallbackRegex, '').trim();
            // Remove special characters like - or : at the edge
            textWithoutPhone = textWithoutPhone.replace(/^[:\-\s]+|[:\-\s]+$/g, '');
            if (textWithoutPhone.length > 0) {
                companyName = textWithoutPhone;
            }
        } else {
            for (let i = 0; i < lines.length; i++) {
                if (i !== phoneLineIndex) {
                    companyName = lines[i];
                    break;
                }
            }
        }

        // Remove qualquer dado copiado de planilhas após o nome (separa por tab ou duplos/múltiplos espaços)
        companyName = companyName.split('\t')[0].split('  ')[0].trim();
        // Remove prefixos como "Construtora", "Empresa", etc.
        companyName = companyName.replace(/^(construtora|empresa|empreendimento|nome)[:\-\s]+/i, '').trim();
    }

    return { phone, companyName };
}

function previewMensagemInteligente() {
    const text = document.getElementById('smartData').value;
    const previewBox = document.getElementById('mensagemPreview');
    const previewText = document.getElementById('previewText');

    if (text.trim().length === 0) {
        previewBox.style.display = 'none';
        return;
    }

    const { companyName, phone } = extractSmartData(text);
    const msg = `Opa... tudo bem? é do comercial da ${companyName}?`;

    previewText.innerText = msg;
    previewBox.style.display = 'block';
}

function redirectToWhatsAppSmart() {
    const text = document.getElementById('smartData').value;
    const errorMsg = document.getElementById('smartErrorMsg');
    const textarea = document.getElementById('smartData');

    const { phone, companyName } = extractSmartData(text);

    if (!phone || phone.length < 10) {
        errorMsg.style.display = 'block';
        textarea.style.borderColor = '#ea0038';
        return;
    }

    errorMsg.style.display = 'none';
    textarea.style.borderColor = '#e9edef';

    const msg = `Opa... tudo bem? é do comercial da ${companyName}?`;
    const encodedMsg = encodeURIComponent(msg);

    const url = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodedMsg}&type=phone_number&app_absent=0`;
    window.open(url, '_blank');

    // Salva o contato
    let contacts = JSON.parse(localStorage.getItem('wapp_contacts') || '[]');
    const now = new Date();

    contacts.push({
        id: Date.now(),
        name: companyName,
        phone: phone,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('wapp_contacts', JSON.stringify(contacts));

    renderContacts();
}

function renderContacts() {
    let contacts = JSON.parse(localStorage.getItem('wapp_contacts') || '[]');
    const listEl = document.getElementById('contactsList');
    listEl.innerHTML = '';

    const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('currentDate').innerText = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

    // Reverte para mostrar os mais novos no topo
    [...contacts].reverse().forEach(contact => {
        const li = document.createElement('li');
        li.className = 'contact-item';
        li.innerHTML = `
            <div class="contact-info">
                <span class="contact-name">${contact.name}</span>
                <span class="contact-phone">${contact.phone}</span>
                <span class="contact-time">${contact.date} às ${contact.time}</span>
            </div>
            <button class="remove-btn" onclick="removeContact(${contact.id})" title="Remover contato">X</button>
        `;
        listEl.appendChild(li);
    });

    // Atualiza o contador de topo
    document.getElementById('contactCounter').innerText = contacts.length;
}

function removeContact(id) {
    let contacts = JSON.parse(localStorage.getItem('wapp_contacts') || '[]');
    contacts = contacts.filter(c => c.id !== id);
    localStorage.setItem('wapp_contacts', JSON.stringify(contacts));
    renderContacts();
}

function exportToCSV() {
    let contacts = JSON.parse(localStorage.getItem('wapp_contacts') || '[]');
    if (contacts.length === 0) {
        alert("Não há contatos para exportar.");
        return;
    }

    // Adiciona BOM para caracteres especiais abrirem corretamente no Excel do Windows
    let csvContent = "\uFEFFNome;Telefone;Data;Hora\n";
    contacts.forEach(c => {
        csvContent += `"${c.name}";"${c.phone}";"${c.date}";"${c.time}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contatados_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.onload = function () {
    // Migrar o contador antigo caso exista
    let oldCounter = localStorage.getItem('wapp_contact_count');
    if (oldCounter) {
        // remove o velho para não conflitar
        localStorage.removeItem('wapp_contact_count');
    }
    renderContacts();
};
