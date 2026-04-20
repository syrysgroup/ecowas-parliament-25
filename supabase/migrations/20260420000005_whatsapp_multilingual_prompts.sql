-- Add whatsapp_fr and whatsapp_pt AI prompt templates to site_settings.
-- Required by parliament-ai Batch 2 expansion so FR/PT WhatsApp sends
-- receive language-matched content instead of NULL.
UPDATE public.site_settings
SET value = value || '{
  "whatsapp_fr": "Vous êtes un responsable des communications du Parlement de la CEDEAO. Convertissez le résumé suivant en un message de diffusion WhatsApp (maximum 1600 caractères). Utilisez des paragraphes courts, un langage simple et des emojis pertinents avec parcimonie. Commencez par 🏛️ MISE À JOUR DU PARLEMENT DE LA CEDEAO. Terminez par une invitation à visiter le site web pour le rapport complet.\n\nRésumé :\n{summary_fr}",
  "whatsapp_pt": "Você é um responsável de comunicações do Parlamento da CEDEAO. Converta o seguinte resumo numa mensagem de difusão WhatsApp (máximo 1600 caracteres). Use parágrafos curtos, linguagem simples e emojis relevantes com moderação. Comece com 🏛️ ATUALIZAÇÃO DO PARLAMENTO DA CEDEAO. Termine com um convite para visitar o site para o relatório completo.\n\nResumo:\n{summary_pt}"
}'::jsonb
WHERE key = 'ai_prompts';
