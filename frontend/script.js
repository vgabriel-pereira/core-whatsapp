document.addEventListener('DOMContentLoaded', () => {
  // --- LOGIN ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const body = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (data.success) {
          alert('Login realizado com sucesso!');
          window.location.href = 'index.html';
        } else {
          alert(data.message || 'Erro ao fazer login.');
        }
      } catch (err) {
        console.error('Erro no login:', err);
        alert('Erro na comunicação com o servidor.');
      }
    });
  }

  // --- DISPARO DE MENSAGENS ---
  const disparoForm = document.getElementById('disparo-form');
  if (disparoForm) {
    disparoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(disparoForm);
      const file = formData.get('file');
      const image = formData.get('image');
      const messageText = disparoForm.querySelector('textarea[name="message"]').value;

      if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        alert('Anexe uma planilha .xlsx válida.');
        return;
      }

      try {
        // Verifica se já há mensagens enviadas
        const contactsRes = await fetch('http://localhost:3000/message/contacts?status=sent');
        const contacts = await contactsRes.json();

        if (contacts.length > 0) {
          alert('Apague a campanha anterior antes de enviar uma nova.');
          return;
        }

        // Upload da planilha + imagem (opcional)
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        if (image && image.name) {
          uploadFormData.append('image', image);
        }

        const uploadRes = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) {
          alert(uploadResult.message || 'Erro ao enviar arquivos.');
          return;
        }

        // Disparo das mensagens
        const disparoRes = await fetch('http://localhost:3000/message/send-from-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, image: uploadResult.image }),
        });
  
        const disparoResult = await disparoRes.json();
        if (!disparoResult.success) {
          alert(disparoResult.message || 'Erro ao disparar mensagens.');
          return;
        }
  
        alert('Mensagens enviadas com sucesso!');
        loadContacts?.();
      } catch (err) {
        console.error('Erro no disparo:', err);
        alert('Erro na comunicação com o servidor.');
      }
    });
  }

  // --- EXCLUIR CONTATOS ENVIADOS ---
  async function deleteSentContacts() {
    const confirmed = confirm('Tem certeza que deseja apagar os contatos enviados?');
    if (!confirmed) return;

    try {
      const res = await fetch('http://localhost:3000/message/delete-sent', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('Contatos enviados apagados com sucesso!');
        loadContacts?.();
      } else {
        alert(data.message || 'Erro ao apagar contatos.');
      }
    } catch (err) {
      console.error('Erro ao apagar contatos:', err);
      alert('Erro ao se comunicar com o servidor.');
    }
  }

  // --- BOTÃO DINÂMICO: APAGAR CAMPANHA ANTERIOR ---
  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Apagar campanha anterior';
  btnDelete.style.marginTop = '1rem';
  btnDelete.addEventListener('click', deleteSentContacts);
  document.body.appendChild(btnDelete);

  // --- VERIFICAR STATUS E QR DO WHATSAPP ---
  async function checkWhatsAppStatus() {
    try {
      const statusRes = await fetch('http://localhost:3000/message/status');
      const { connected } = await statusRes.json();

      const statusText = document.getElementById('status-text');
      const qrImg = document.getElementById('qr-code');

      if (connected) {
        statusText.textContent = '✅ WhatsApp conectado!';
        qrImg.style.display = 'none';
      } else {
        statusText.textContent = '❌ Não conectado. Escaneie o QR abaixo.';
        const qrRes = await fetch('http://localhost:3000/message/qr');
        const { qr } = await qrRes.json();
        qrImg.src = qr;
        qrImg.style.display = 'block';
      }
    } catch (err) {
      console.error('Erro ao verificar status do WhatsApp:', err);
    }
  }

  checkWhatsAppStatus();
  setInterval(checkWhatsAppStatus, 5000);
});
