ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS when_not_to_use text;

UPDATE public.tools SET when_not_to_use = 'Don''t use as a final decision-maker. Verify facts with citations elsewhere. Don''t paste secrets — assume content goes into a future training set.' WHERE slug = 'claude';
UPDATE public.tools SET when_not_to_use = 'Always review what it changes before committing. Not a substitute for understanding your codebase. Risky on production code without tests.' WHERE slug = 'claude-code';
UPDATE public.tools SET when_not_to_use = 'Limited context vs full Claude. Use the standalone app for anything that needs deep reasoning across multiple files.' WHERE slug = 'co-pilot';
UPDATE public.tools SET when_not_to_use = 'Knowledge cutoff matters. Don''t trust it on news, current events, or anything time-sensitive without external verification.' WHERE slug = 'chatgpt';
UPDATE public.tools SET when_not_to_use = 'Real-time access doesn''t mean accuracy. Verify claims independently, especially anything political or contested.' WHERE slug = 'grok';
UPDATE public.tools SET when_not_to_use = 'Quality varies across modes. Deep Research is strong; quick chat can be weak. Don''t assume one good answer means the next will be.' WHERE slug = 'gemini';
UPDATE public.tools SET when_not_to_use = 'Cited isn''t the same as correct. Click through and read the actual sources before quoting anything.' WHERE slug = 'perplexity';
UPDATE public.tools SET when_not_to_use = 'Slow and expensive. Don''t use it for quick answers — it''s built for deep autonomous tasks that take five-plus minutes.' WHERE slug = 'manus';
UPDATE public.tools SET when_not_to_use = 'Only as good as the sources you give it. Won''t make up content, but also can''t verify what''s in your sources.' WHERE slug = 'notebooklm';
UPDATE public.tools SET when_not_to_use = 'Built for prototypes, not production code without review. Don''t ship a Lovable app to real users without a code-quality pass.' WHERE slug = 'lovable';
UPDATE public.tools SET when_not_to_use = 'Less mature than Lovable. Use as a second opinion when comparing builds, not as your primary build tool yet.' WHERE slug = 'base44';
UPDATE public.tools SET when_not_to_use = 'Specific cinematic aesthetic. Not the right tool for every photographic style — best for stylised, atmospheric output.' WHERE slug = 'higgsfield';
UPDATE public.tools SET when_not_to_use = 'Licensing platform, not music generation. Doesn''t replace original composition where rights are sensitive.' WHERE slug = 'artlist';
UPDATE public.tools SET when_not_to_use = 'Output varies wildly. Plan for multiple takes and budget for iteration — single shots rarely land.' WHERE slug = 'nano-banana-veo';
UPDATE public.tools SET when_not_to_use = 'Voice-to-text, not voice control. Doesn''t navigate apps or run shortcuts — that''s a different category of tool.' WHERE slug = 'wispr-flow';
UPDATE public.tools SET when_not_to_use = 'Transcription quality depends on audio. Live background noise, multiple speakers, or poor mics noticeably hurt accuracy.' WHERE slug = 'granola';
UPDATE public.tools SET when_not_to_use = 'Local-first means sync isn''t automatic. Set up Obsidian Sync, iCloud, or git before assuming your notes are backed up.' WHERE slug = 'obsidian';