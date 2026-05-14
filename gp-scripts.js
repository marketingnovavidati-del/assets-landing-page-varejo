    (function () {
      'use strict';

      /* ============ Reveal animations ============ */
      document.documentElement.classList.add('reveal-armed');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if ('IntersectionObserver' in window && !reduced) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
      } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      }

      /* ============ Smooth scroll-to anchors (CTAs) ============ */
      document.querySelectorAll('[data-scroll-to]').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = document.querySelector(btn.dataset.scrollTo);
          if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        });
      });

      /* ============ Nav center · indicator slider ============ */
      const navCenter = document.querySelector('.nav-center');
      const navIndicator = document.querySelector('.nav-indicator');
      const navLinks = document.querySelectorAll('.nav-center a');

      function moveIndicator(target) {
        if (!target || !navIndicator || !navCenter) return;
        const rect = target.getBoundingClientRect();
        const parentRect = navCenter.getBoundingClientRect();
        navIndicator.style.transform = 'translateX(' + (rect.left - parentRect.left) + 'px)';
        navIndicator.style.width = rect.width + 'px';
      }
      function updateIndicator() {
        const active = document.querySelector('.nav-center a.active');
        moveIndicator(active);
      }
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          navLinks.forEach(a => a.classList.toggle('active', a === link));
          moveIndicator(link);
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        });
      });
      window.addEventListener('resize', updateIndicator);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateIndicator);
      } else {
        window.addEventListener('load', updateIndicator);
      }
      // initial
      setTimeout(updateIndicator, 50);

      /* ============ Active section tracking (scroll spy) ============ */
      const sectionIds = ['hero', 'problema', 'diagnostico', 'entregaveis', 'confianca'];
      const trackedSections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
      if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              const href = '#' + e.target.id;
              navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === href));
              updateIndicator();
            }
          });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        trackedSections.forEach(s => spy.observe(s));
      }

      /* ============ Nav theme detection (data-nav-dark over .is-dark-bg) ============ */
      const darkSections = document.querySelectorAll('.is-dark-bg');
      const NAV_HEIGHT = 80;
      function checkNavTheme() {
        let dark = false;
        darkSections.forEach(s => {
          const rect = s.getBoundingClientRect();
          if (rect.top <= NAV_HEIGHT && rect.bottom >= NAV_HEIGHT) dark = true;
        });
        if (dark) document.documentElement.setAttribute('data-nav-dark', '');
        else document.documentElement.removeAttribute('data-nav-dark');
      }
      window.addEventListener('scroll', checkNavTheme, { passive: true });
      window.addEventListener('resize', checkNavTheme);
      checkNavTheme();

      /* ============ Mobile drawer ============ */
      const burger = document.getElementById('navBurger');
      const drawer = document.getElementById('navDrawer');
      const drawerClose = document.getElementById('navDrawerClose');
      const drawerCta = document.getElementById('navDrawerCta');
      const drawerLinks = document.querySelectorAll('[data-drawer-link]');

      function openDrawer() {
        drawer.classList.add('is-open');
        burger.classList.add('is-open');
        burger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('drawer-open');
      }
      function closeDrawer() {
        drawer.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('drawer-open');
      }

      if (burger) burger.addEventListener('click', () => {
        drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
      });
      if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
      if (drawerCta) drawerCta.addEventListener('click', () => {
        closeDrawer();
        setTimeout(() => {
          const target = document.getElementById('form');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 380);
      });
      drawerLinks.forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const href = a.getAttribute('href');
          closeDrawer();
          setTimeout(() => {
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 380);
        });
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
      });

      /* ============ Custom select ============ */
      document.querySelectorAll('[data-custom-select]').forEach(sel => {
        const trigger = sel.querySelector('.custom-select-trigger');
        const valueEl = sel.querySelector('.custom-select-value');
        const options = sel.querySelectorAll('[role="option"]');
        const hidden = sel.querySelector('select');
        let openIdx = -1;

        function close() { sel.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
        function open() { sel.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true'); }

        trigger.addEventListener('click', () => {
          sel.classList.contains('is-open') ? close() : open();
        });

        options.forEach((opt, idx) => {
          opt.tabIndex = -1;
          opt.addEventListener('click', () => {
            valueEl.textContent = opt.textContent;
            trigger.classList.remove('is-empty');
            if (hidden) hidden.value = opt.dataset.value;
            options.forEach(o => o.classList.remove('is-selected'));
            opt.classList.add('is-selected');
            sel.classList.remove('error');
            close();
          });
          opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); options[(idx + 1) % options.length].focus(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); options[(idx - 1 + options.length) % options.length].focus(); }
            if (e.key === 'Escape') { close(); trigger.focus(); }
          });
        });

        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); open(); options[0].focus();
          }
        });

        document.addEventListener('click', (e) => {
          if (!sel.contains(e.target)) close();
        });
      });

      /* ============ Masks (telefone + CNPJ) ============ */
      // Campo é celular · sempre formato (XX) XXXXX-XXXX, traço só aparece quando tem dígito depois
      function maskTelefone(raw) {
        const d = (raw || '').replace(/\D/g, '').slice(0, 11);
        if (d.length === 0) return '';
        if (d.length <= 2) return '(' + d;
        if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
        return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      }

      function maskCnpj(raw) {
        const d = (raw || '').replace(/\D/g, '').slice(0, 14);
        if (d.length === 0) return '';
        let out = d.slice(0, 2);
        if (d.length >= 3) out += '.' + d.slice(2, 5);
        if (d.length >= 6) out += '.' + d.slice(5, 8);
        if (d.length >= 9) out += '/' + d.slice(8, 12);
        if (d.length >= 13) out += '-' + d.slice(12);
        return out;
      }

      const phoneInput = document.getElementById('telefone');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => { e.target.value = maskTelefone(e.target.value); });
      }

      /* ============ Form validation + submit ============ */
      const form = document.getElementById('leadForm');
      const formSuccess = document.getElementById('formSuccess');
      const personalEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br', 'live.com', 'icloud.com', 'bol.com.br', 'uol.com.br', 'terra.com.br'];

      function setError(input, on) {
        input.classList.toggle('error', on);
      }
      function setSelectError(sel, on) {
        sel.classList.toggle('error', on);
      }

      if (form) {
        const cnpjInput = document.getElementById('cnpj');
        if (cnpjInput) {
          cnpjInput.addEventListener('input', (e) => { e.target.value = maskCnpj(e.target.value); });
        }

        // Autofill do Chrome não dispara `input` · usa animationstart do :-webkit-autofill como detector + change como backup
        function bindAutofillMask(el, maskFn) {
          if (!el) return;
          const apply = () => { el.value = maskFn(el.value); };
          el.addEventListener('animationstart', (e) => {
            if (e.animationName === 'nv-autofill-detect') setTimeout(apply, 0);
          });
          el.addEventListener('change', apply);
        }
        bindAutofillMask(phoneInput, maskTelefone);
        bindAutofillMask(cnpjInput, maskCnpj);

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          // Re-aplica máscaras antes de validar · cobre autofill (que não dispara `input`)
          if (phoneInput) phoneInput.value = maskTelefone(phoneInput.value);
          if (cnpjInput) cnpjInput.value = maskCnpj(cnpjInput.value);
          let valid = true;

          const nome = form.nome;
          const empresa = form.empresa;
          const cnpj = cnpjInput;
          const telefone = phoneInput;
          const email = form.email;
          const desafioSel = form.querySelector('[data-custom-select]');

          if (!nome.value.trim() || nome.value.trim().length < 2) { setError(nome, true); valid = false; } else setError(nome, false);
          if (!empresa.value.trim()) { setError(empresa, true); valid = false; } else setError(empresa, false);

          const cnpjDigits = cnpj.value.replace(/\D/g, '');
          if (cnpjDigits.length !== 14) { setError(cnpj, true); valid = false; } else setError(cnpj, false);

          const phoneDigits = telefone.value.replace(/\D/g, '');
          if (phoneDigits.length !== 11) { setError(telefone, true); valid = false; } else setError(telefone, false);

          const emailVal = email.value.trim().toLowerCase();
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const domain = emailVal.split('@')[1] || '';
          if (!emailRe.test(emailVal) || personalEmailDomains.includes(domain)) {
            setError(email, true); valid = false;
          } else setError(email, false);

          const desafioValue = form.desafio.value;
          if (!desafioValue) { setSelectError(desafioSel, true); valid = false; } else setSelectError(desafioSel, false);

          if (!valid) {
            const firstError = form.querySelector('.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }

          // visual success (sem POST de verdade)
          form.style.display = 'none';
          formSuccess.classList.add('show');
        });
      }

      /* ============ Bloco 4 · Card-deck 3D (padrão patternbreak) ============ */
      const entShell = document.querySelector('.ent-shell');
      if (entShell) {
        const entTitles = entShell.querySelectorAll('.ent-title');
        const entCards = entShell.querySelectorAll('.ent-card');
        const entDescs = entShell.querySelectorAll('.ent-desc');
        const entCurrent = entShell.querySelector('[data-ent-current]');
        const entPrev = entShell.querySelector('.ent-prev');
        const entNext = entShell.querySelector('.ent-next');
        const entTotal = entCards.length;

        function entSync() {
          const activeCard = entShell.querySelector('.ent-card[data-pos="0"]');
          if (!activeCard) return;
          const id = activeCard.dataset.ent;
          entTitles.forEach(t => t.classList.toggle('is-active', t.dataset.ent === id));
          entDescs.forEach(d => d.classList.toggle('is-active', d.dataset.ent === id));
          if (entCurrent) entCurrent.textContent = String(parseInt(id, 10) + 1).padStart(2, '0');
        }

        function entShift(direction) {
          entCards.forEach(card => {
            const pos = parseInt(card.dataset.pos, 10);
            const newPos = (pos - direction + entTotal) % entTotal;
            card.dataset.pos = newPos;
          });
          entSync();
        }

        if (entPrev) entPrev.addEventListener('click', () => entShift(-1));
        if (entNext) entNext.addEventListener('click', () => entShift(+1));

        entShell.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); entShift(-1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); entShift(+1); }
        });

        entSync();
      }

      /* ============ Timeline (Bloco 3 · scroll-driven, padrão Ciridae) ============ */
      const tlTrack = document.querySelector('[data-tl-track]');
      if (tlTrack && !reduced) {
        const tlItems = tlTrack.querySelectorAll('.tl-item');
        const tlLineFill = tlTrack.querySelector('.tl-line-fill');

        /* Active item · IntersectionObserver com rootMargin centralizado */
        const tlSpy = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              tlItems.forEach(i => i.classList.toggle('active', i === e.target));
            }
          });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        tlItems.forEach(i => tlSpy.observe(i));

        /* Line fill progress baseado no scroll */
        let tlTicking = false;
        function updateTlFill() {
          if (!tlLineFill) return;
          const rect = tlTrack.getBoundingClientRect();
          const vh = window.innerHeight;
          const middle = vh * 0.5;
          let progress = 0;
          if (rect.bottom <= middle) {
            progress = 1;
          } else if (rect.top < middle) {
            progress = Math.min(1, Math.max(0, (middle - rect.top) / rect.height));
          }
          tlLineFill.style.height = (progress * 100) + '%';
          tlTicking = false;
        }
        function onTlScroll() {
          if (!tlTicking) { requestAnimationFrame(updateTlFill); tlTicking = true; }
        }
        window.addEventListener('scroll', onTlScroll, { passive: true });
        window.addEventListener('resize', onTlScroll);
        updateTlFill();
      } else if (tlTrack) {
        /* reduced motion · todos ativos sem animação */
        tlTrack.querySelectorAll('.tl-item').forEach(i => i.classList.add('active'));
        const fill = tlTrack.querySelector('.tl-line-fill');
        if (fill) fill.style.height = '100%';
      }

      /* ============ Bloco 2 v4 · Voxr-style (sticky + scroll-driven cards) ============ */
      const vxShell = document.querySelector('.vx-shell');
      const problemaTrack = document.querySelector('.problema-track');

      // === Entrance do conteúdo central (pill, headline, body) — IntersectionObserver
      if (vxShell) {
        if ('IntersectionObserver' in window && !reduced) {
          const vxIO = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                vxShell.classList.add('is-in');
                vxIO.unobserve(e.target);
              }
            });
          }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
          vxIO.observe(vxShell);
        } else {
          vxShell.classList.add('is-in');
        }
      }

      // === Cards scroll-driven (sobem de baixo pra cima conforme scroll) ===
      if (problemaTrack && !reduced) {
        const vxCards = problemaTrack.querySelectorAll('.vx-card');
        const closeEl = problemaTrack.querySelector('.problema-close');
        const problemaInfo = problemaTrack.querySelector('.problema-info');
        const cardRots = Array.from(vxCards).map(c =>
          parseFloat(getComputedStyle(c).getPropertyValue('--rot')) || 0
        );

        let vxTicking = false;

        function updateVxCards() {
          const rect = problemaTrack.getBoundingClientRect();
          const trackHeight = rect.height;
          const vh = window.innerHeight;

          // Cards começam quando panel trava · LOCK_OFFSET = quanto do track scrolla antes do lock
          // (intro section + padding) · ajusta esse valor pra alinhar progress=0 com o momento da trava
          const LOCK_OFFSET = window.innerWidth <= 1024 ? 40 : 380;
          let progress = 0;
          if (rect.top <= -LOCK_OFFSET && rect.bottom >= vh) {
            progress = (-rect.top - LOCK_OFFSET) / (trackHeight - vh - LOCK_OFFSET);
          } else if (rect.bottom < vh) {
            progress = 1;
          }
          progress = Math.max(0, Math.min(1, progress));

          // === Cards · CASCADE CONTÍNUO ===
          // Cada card tem motion contínua (entrada â†’ meio â†’ saída sem pausa).
          // Cards staggered · 01 entra, logo depois 02, 03, 04.
          // Quando 02 está entrando, 01 continua subindo até sumir.
          // No meio do bloco 2, vários cards visíveis ao mesmo tempo em
          // diferentes posições verticais (cascade flow).
          const RISE_FROM = window.innerHeight * 1.0;     // offscreen abaixo
          const RISE_TO = -window.innerHeight * 0.9;      // offscreen acima
          const CARD_STARTS = [0.00, 0.04, 0.08, 0.12];   // cards começam imediatamente quando bloco 2 trava
          const CARD_DURATION = 0.38;                      // cada card tem ~38% do scroll
          const FADE_THRESHOLD = 0.55;                     // a partir desse t, começa fade
          const CLOSE_START = 0.56;
          const CLOSE_END = 0.78;

          vxCards.forEach((card, i) => {
            const start = CARD_STARTS[i];
            const end = start + CARD_DURATION;

            let translateY, opacity;
            if (progress < start) {
              // Ainda não entrou
              opacity = 0;
              translateY = RISE_FROM;
            } else if (progress > end) {
              // Já saiu
              opacity = 0;
              translateY = RISE_TO;
            } else {
              // Motion contínua de RISE_FROM até RISE_TO
              const t = (progress - start) / CARD_DURATION; // 0 â†’ 1
              // Easing sine ease-in-out · movimento natural e fluido
              const tyEase = 0.5 - 0.5 * Math.cos(t * Math.PI);
              translateY = RISE_FROM + (RISE_TO - RISE_FROM) * tyEase;

              // Opacity · full opacity até FADE_THRESHOLD, depois fade out
              if (t <= FADE_THRESHOLD) {
                opacity = 1; // SEM fade in · card visível desde que entra
              } else {
                const fadeT = (t - FADE_THRESHOLD) / (1 - FADE_THRESHOLD);
                const eased = 1 - Math.cos(fadeT * Math.PI / 2);
                opacity = 1 - eased; // fade out suave (sine ease-in)
              }
            }

            const rot = cardRots[i];
            const isMobile = getComputedStyle(card).getPropertyValue('--vx-mobile').trim() === '1';
            if (isMobile) {
              card.style.transform = `translate(-50%, -50%) translateY(${translateY}px) rotate(${rot}deg)`;
            } else {
              card.style.transform = `translateY(${translateY}px) rotate(${rot}deg)`;
            }
            card.style.opacity = opacity;
          });

          // === Close text fade-in (cards já fora) — ainda dentro do lock ===
          if (closeEl) {
            let closeOpacity = 0;
            if (progress > CLOSE_START) {
              const t = Math.min(1, (progress - CLOSE_START) / (CLOSE_END - CLOSE_START));
              closeOpacity = 1 - Math.pow(1 - t, 2);
            }
            closeEl.style.opacity = closeOpacity;
          }

          // === Insight bubble · entrada moderna depois dos cards passarem ===
          if (problemaInfo) {
            const REVEAL_AT = 0.55; // após cards começarem a fade out
            if (progress >= REVEAL_AT) {
              problemaInfo.classList.add('is-visible');
            } else {
              problemaInfo.classList.remove('is-visible');
            }
          }

          vxTicking = false;
        }

        function onVxScroll() {
          if (!vxTicking) {
            requestAnimationFrame(updateVxCards);
            vxTicking = true;
          }
        }

        window.addEventListener('scroll', onVxScroll, { passive: true });
        window.addEventListener('resize', onVxScroll);
        updateVxCards();
      } else if (problemaTrack) {
        // reduced motion: cards visíveis na posição final, sem scroll-driven
        problemaTrack.querySelectorAll('.vx-card').forEach((card, i) => {
          const rot = parseFloat(getComputedStyle(card).getPropertyValue('--rot')) || 0;
          const isMobile = getComputedStyle(card).getPropertyValue('--vx-mobile').trim() === '1';
          if (isMobile) {
            card.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
          } else {
            card.style.transform = `translateY(0) rotate(${rot}deg)`;
          }
          card.style.opacity = 1;
        });
      }

      /* ============ Cookie banner ============ */
      const banner = document.getElementById('cookieBanner');
      const KEY = 'nv_cookie_consent';
      function showCookies() {
        banner.removeAttribute('hidden');
        requestAnimationFrame(() => banner.classList.add('show'));
      }
      function hideCookies() {
        banner.classList.remove('show');
        setTimeout(() => banner.setAttribute('hidden', ''), 400);
      }
      if (!localStorage.getItem(KEY)) {
        setTimeout(showCookies, 1500);
      }
      document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem(KEY, 'accepted');
        hideCookies();
      });
      document.getElementById('cookieReject').addEventListener('click', () => {
        localStorage.setItem(KEY, 'rejected');
        hideCookies();
      });

      /* ============ News Chat Bubble ============ */
      const newsBubble = document.getElementById('newsBubble');
      const newsBubbleClose = document.getElementById('newsBubbleClose');

      if (newsBubble && newsBubbleClose) {
        let dismissed = false;

        /* Abre depois de 1s · ancorado no hero, rola junto com a página */
        setTimeout(() => {
          if (dismissed) return;
          newsBubble.classList.add('is-open');
          /* "digitando..." 1s, depois revela mensagem */
          setTimeout(() => {
            if (dismissed) return;
            newsBubble.classList.add('is-typed');
          }, 1000);
        }, 1000);

        /* X · dismiss permanente · só some quando o usuário fechar */
        newsBubbleClose.addEventListener('click', () => {
          dismissed = true;
          newsBubble.classList.add('is-dismissed');
          newsBubble.classList.remove('is-open');
        });
      }

    })();
