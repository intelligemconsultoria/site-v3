import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is incomplete');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend client
const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

// Auth middleware - check if user is authenticated
async function requireAuth(request: Request): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Missing or invalid authorization header' };
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.error('Auth verification error:', error);
      return { authorized: false, error: 'Invalid or expired token' };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { authorized: false, error: 'Authentication verification failed' };
  }
}

// Site images bucket
const SITE_IMAGES_BUCKET = 'static-images';

// Create bucket on startup
async function initializeBuckets() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === SITE_IMAGES_BUCKET);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(SITE_IMAGES_BUCKET, {
        public: false, // Private bucket for security
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log(`Bucket ${SITE_IMAGES_BUCKET} created successfully`);
      }
    }
  } catch (error) {
    console.error('Error initializing buckets:', error);
  }
}

// Initialize on startup
initializeBuckets();

// Health check endpoint
app.get("/make-server-a91235ef/health", (c) => {
  return c.json({ status: "ok" });
});

// Blog Images endpoints - COMPATIBILITY ROUTES
app.get("/make-server-a91235ef/images", async (c) => {
  try {
    // Get all blog images from KV store
    const images = await kv.getByPrefix('image:');
    const imagesData = images.map(item => ({
      id: item.key.replace('image:', ''),
      ...item.value
    }));
    
    return c.json(imagesData);
  } catch (error) {
    console.error('Error fetching blog images:', error);
    return c.json({ error: 'Failed to fetch images' }, 500);
  }
});

app.post("/make-server-a91235ef/images", async (c) => {
  try {
    const imageData = await c.req.json();
    const { id, ...data } = imageData;
    
    if (!id) {
      return c.json({ error: 'Image ID is required' }, 400);
    }
    
    await kv.set(`image:${id}`, data);
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Error saving blog image:', error);
    return c.json({ error: 'Failed to save image' }, 500);
  }
});

app.get("/make-server-a91235ef/images/category/:category", async (c) => {
  try {
    const category = c.req.param('category');
    const images = await kv.getByPrefix('image:');
    const filteredImages = images
      .filter(item => item.value.category === category)
      .map(item => ({
        id: item.key.replace('image:', ''),
        ...item.value
      }));
    
    return c.json(filteredImages);
  } catch (error) {
    console.error('Error fetching images by category:', error);
    return c.json({ error: 'Failed to fetch images by category' }, 500);
  }
});

app.put("/make-server-a91235ef/images/:id", async (c) => {
  try {
    const imageId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingImage = await kv.get(`image:${imageId}`);
    if (!existingImage) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const updatedImage = { ...existingImage, ...updates };
    await kv.set(`image:${imageId}`, updatedImage);
    
    return c.json({ success: true, image: updatedImage });
  } catch (error) {
    console.error('Error updating image:', error);
    return c.json({ error: 'Failed to update image' }, 500);
  }
});

app.delete("/make-server-a91235ef/images/:id", async (c) => {
  try {
    const imageId = c.req.param('id');
    
    const existingImage = await kv.get(`image:${imageId}`);
    if (!existingImage) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    await kv.del(`image:${imageId}`);
    return c.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return c.json({ error: 'Failed to delete image' }, 500);
  }
});

// Site Images Upload endpoint - PROTECTED
app.post("/make-server-a91235ef/site-images/upload", async (c) => {
  try {
    // Check authentication
    const authResult = await requireAuth(c.req.raw);
    if (!authResult.authorized) {
      return c.json({ error: authResult.error || 'Unauthorized access' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const imageKey = formData.get('imageKey') as string;
    const category = formData.get('category') as string;
    
    if (!file || !imageKey) {
      return c.json({ error: 'File and imageKey are required' }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${imageKey}-${Date.now()}.${fileExt}`;
    
    // Convert File to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .upload(fileName, fileData, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL (24 hours)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .createSignedUrl(fileName, 86400); // 24 hours

    if (signedError) {
      console.error('Signed URL error:', signedError);
      return c.json({ error: 'Failed to create signed URL' }, 500);
    }

    // Save metadata
    const imageMetadata = {
      key: imageKey,
      filename: fileName,
      originalName: file.name,
      category: category || 'uncategorized',
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      publicUrl: signedData.signedUrl
    };
    
    await kv.set(`site-image:${imageKey}`, imageMetadata);
    
    return c.json({ 
      success: true, 
      url: signedData.signedUrl,
      filename: fileName,
      metadata: imageMetadata
    });
  } catch (error) {
    console.error('Error uploading site image:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Get all site images
app.get("/make-server-a91235ef/site-images", async (c) => {
  try {
    console.log('🔍 [Edge Function] Fetching site images...');
    console.log('🔍 [Edge Function] Using bucket:', SITE_IMAGES_BUCKET);
    
    // First, try to get images from KV store
    const images = await kv.getByPrefix('site-image:');
    console.log('📊 [Edge Function] Found images in KV:', images.length);
    
    if (images.length === 0) {
      console.log('⚠️ [Edge Function] No images in KV store, returning empty array');
      return c.json([]);
    }
    
    console.log('🔄 [Edge Function] Processing images...');
    const imagesData = await Promise.all(
      images.map(async (item) => {
        try {
          const metadata = item.value;
          console.log('🖼️ [Edge Function] Processing image:', item.key, 'metadata:', metadata);
          
          if (!metadata || !metadata.filename) {
            console.error('❌ [Edge Function] Invalid metadata for image:', item.key);
            return null;
          }
          
          console.log('🔗 [Edge Function] Generating signed URL for:', metadata.filename);
          
          // Generate fresh signed URL
          const { data: signedData, error: signedError } = await supabase.storage
            .from(SITE_IMAGES_BUCKET)
            .createSignedUrl(metadata.filename, 86400);
          
          if (signedError) {
            console.error('❌ [Edge Function] Signed URL error for', metadata.filename, signedError);
            return {
              key: item.key.replace('site-image:', ''),
              ...metadata,
              publicUrl: metadata.publicUrl || 'https://via.placeholder.com/400x300?text=Image+Not+Found'
            };
          }
          
          console.log('✅ [Edge Function] Generated signed URL for:', metadata.filename);
          
          return {
            key: item.key.replace('site-image:', ''),
            ...metadata,
            publicUrl: signedData?.signedUrl || metadata.publicUrl
          };
        } catch (itemError) {
          console.error('❌ [Edge Function] Error processing image item:', item.key, itemError);
          return null;
        }
      })
    );
    
    // Filter out null values
    const validImages = imagesData.filter(img => img !== null);
    console.log('✅ [Edge Function] Returning valid images:', validImages.length);
    
    return c.json(validImages);
  } catch (error) {
    console.error('❌ [Edge Function] Error fetching site images:', error);
    console.error('❌ [Edge Function] Error details:', error.message);
    console.error('❌ [Edge Function] Error stack:', error.stack);
    return c.json({ 
      error: 'Failed to fetch images', 
      details: error.message,
      stack: error.stack 
    }, 500);
  }
});

// Get site image by key
app.get("/make-server-a91235ef/site-images/:key", async (c) => {
  try {
    const imageKey = c.req.param('key');
    const metadata = await kv.get(`site-image:${imageKey}`);
    
    if (!metadata) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Generate fresh signed URL
    const { data: signedData } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .createSignedUrl(metadata.filename, 86400);
    
    return c.json({
      key: imageKey,
      ...metadata,
      publicUrl: signedData?.signedUrl || metadata.publicUrl
    });
  } catch (error) {
    console.error('Error fetching site image:', error);
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

// Update site image metadata - PROTECTED
app.put("/make-server-a91235ef/site-images/:key", async (c) => {
  try {
    // Check authentication
    const authResult = await requireAuth(c.req.raw);
    if (!authResult.authorized) {
      return c.json({ error: authResult.error || 'Unauthorized access' }, 401);
    }

    const imageKey = c.req.param('key');
    const updates = await c.req.json();
    
    const existingMetadata = await kv.get(`site-image:${imageKey}`);
    if (!existingMetadata) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const updatedMetadata = { 
      ...existingMetadata, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`site-image:${imageKey}`, updatedMetadata);
    
    return c.json({ success: true, metadata: updatedMetadata });
  } catch (error) {
    console.error('Error updating site image:', error);
    return c.json({ error: 'Failed to update image' }, 500);
  }
});

// Delete site image - PROTECTED
app.delete("/make-server-a91235ef/site-images/:key", async (c) => {
  try {
    // Check authentication
    const authResult = await requireAuth(c.req.raw);
    if (!authResult.authorized) {
      return c.json({ error: authResult.error || 'Unauthorized access' }, 401);
    }

    const imageKey = c.req.param('key');
    
    const metadata = await kv.get(`site-image:${imageKey}`);
    if (!metadata) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(SITE_IMAGES_BUCKET)
      .remove([metadata.filename]);
    
    if (deleteError) {
      console.error('Error deleting from storage:', deleteError);
    }
    
    // Delete metadata
    await kv.del(`site-image:${imageKey}`);
    
    return c.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting site image:', error);
    return c.json({ error: 'Failed to delete image' }, 500);
  }
});

// Get images by category
app.get("/make-server-a91235ef/site-images/category/:category", async (c) => {
  try {
    const category = c.req.param('category');
    const images = await kv.getByPrefix('site-image:');
    
    const filteredImages = await Promise.all(
      images
        .filter(item => item.value.category === category)
        .map(async (item) => {
          const metadata = item.value;
          
          // Generate fresh signed URL
          const { data: signedData } = await supabase.storage
            .from(SITE_IMAGES_BUCKET)
            .createSignedUrl(metadata.filename, 86400);
          
          return {
            key: item.key.replace('site-image:', ''),
            ...metadata,
            publicUrl: signedData?.signedUrl || metadata.publicUrl
          };
        })
    );
    
    return c.json(filteredImages);
  } catch (error) {
    console.error('Error fetching images by category:', error);
    return c.json({ error: 'Failed to fetch images by category' }, 500);
  }
});

// Email sending endpoint
app.post("/make-server-a91235ef/send-email", async (c) => {
  try {
    const { to, subject, html, from } = await c.req.json();
    
    if (!to || !subject || !html) {
      return c.json({ error: 'Missing required fields: to, subject, html' }, 400);
    }

    // Validate Resend API key
    if (!Deno.env.get('RESEND_API_KEY')) {
      console.error('RESEND_API_KEY environment variable not set');
      return c.json({ error: 'Email service not configured' }, 500);
    }

    // Send email via Resend
    const emailData = {
      from: from || 'IntelliGem <noreply@intelligem.com.br>',
      to: [to],
      subject,
      html
    };

    console.log('Sending email:', { to, subject, from: emailData.from });
    
    const emailResult = await resend.emails.send(emailData);
    
    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return c.json({ error: 'Failed to send email', details: emailResult.error }, 500);
    }

    console.log('Email sent successfully:', emailResult.data?.id);

    // Log email notification to database
    try {
      const { error: logError } = await supabase
        .from('email_notifications')
        .insert({
          recipient_email: to,
          subject,
          email_type: 'meeting_notification',
          status: 'sent',
          provider_message_id: emailResult.data?.id,
          metadata: {
            from: emailData.from,
            timestamp: new Date().toISOString()
          }
        });

      if (logError) {
        console.error('Error logging email to database:', logError);
        // Don't fail the request if logging fails
      }
    } catch (logError) {
      console.error('Error logging email:', logError);
      // Continue even if logging fails
    }

    return c.json({ 
      success: true, 
      messageId: emailResult.data?.id 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ error: 'Failed to send email', details: error.message }, 500);
  }
});

// Meeting request with email notifications
app.post("/make-server-a91235ef/meeting-request", async (c) => {
  try {
    const meetingData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['contact_name', 'email', 'company', 'interested_solution', 'preferred_time'];
    for (const field of requiredFields) {
      if (!meetingData[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }

    // Save meeting request to database
    const { data: meeting, error: dbError } = await supabase
      .from('meeting_requests')
      .insert({
        ...meetingData,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return c.json({ error: 'Failed to save meeting request', details: dbError.message }, 500);
    }

    console.log('Meeting request saved:', meeting.id);

    // Send email notifications if configured
    if (Deno.env.get('RESEND_API_KEY')) {
      try {
        // Internal notification email
        const internalEmailData = {
          from: 'IntelliGem <noreply@intelligem.com.br>',
          to: ['intelligemconsultoria@gmail.com'],
          subject: `🗓️ Nova Reunião Agendada - ${meetingData.contact_name} (${meetingData.company})`,
          html: generateInternalEmailTemplate(meetingData)
        };

        // Client confirmation email
        const clientEmailData = {
          from: 'IntelliGem <noreply@intelligem.com.br>',
          to: [meetingData.email],
          subject: '✅ Reunião Agendada com Sucesso - IntelliGem',
          html: generateClientEmailTemplate(meetingData)
        };

        // Send both emails simultaneously
        const [internalResult, clientResult] = await Promise.all([
          resend.emails.send(internalEmailData),
          resend.emails.send(clientEmailData)
        ]);

        // Log email results
        const emailLogs = [];
        
        if (internalResult.data?.id) {
          emailLogs.push({
            recipient_email: 'intelligemconsultoria@gmail.com',
            subject: internalEmailData.subject,
            email_type: 'meeting_notification',
            status: 'sent',
            provider_message_id: internalResult.data.id,
            related_meeting_id: meeting.id,
            metadata: { type: 'meeting_request' }
          });
        }

        if (clientResult.data?.id) {
          emailLogs.push({
            recipient_email: meetingData.email,
            subject: clientEmailData.subject,
            email_type: 'meeting_confirmation',
            status: 'sent',
            provider_message_id: clientResult.data.id,
            related_meeting_id: meeting.id,
            metadata: { type: 'meeting_request' }
          });
        }

        if (emailLogs.length > 0) {
          await supabase.from('email_notifications').insert(emailLogs);
        }

        console.log('Emails sent successfully:', {
          internal: internalResult.data?.id,
          client: clientResult.data?.id
        });

      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the meeting creation if emails fail
      }
    }

    return c.json({ 
      success: true, 
      meeting,
      message: 'Meeting request created successfully' 
    });
  } catch (error) {
    console.error('Error processing meeting request:', error);
    return c.json({ error: 'Failed to process meeting request', details: error.message }, 500);
  }
});

// Helper function to generate internal email template
function generateInternalEmailTemplate(meeting: any): string {
  const solutionNames = {
    'GemFlow': 'GemFlow (Automação de Processos)',
    'GemInsights': 'GemInsights (Dashboards e BI)',
    'GemMind': 'GemMind (Modelos de IA)',
    'All': 'Todas as Soluções'
  };

  const typeNames = {
    'consultation': 'Consultoria Estratégica',
    'demonstration': 'Demonstração Técnica',
    'poc': 'Prova de Conceito',
    'implementation': 'Implementação',
    'support': 'Suporte Técnico'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Reunião Agendada</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #030405; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #030405 0%, #1a1a1a 100%); border-radius: 12px; padding: 32px; border: 1px solid #31af9d20; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #31af9d; margin-bottom: 8px; }
        .title { font-size: 20px; color: #ffffff; margin: 0; }
        .subtitle { color: #94a3b8; margin: 8px 0 0 0; }
        .section { margin: 24px 0; padding: 20px; background: #0f172a; border-radius: 8px; border-left: 4px solid #31af9d; }
        .section-title { font-size: 16px; font-weight: 600; color: #31af9d; margin: 0 0 12px 0; display: flex; align-items: center; }
        .icon { margin-right: 8px; }
        .field { margin: 8px 0; }
        .field-label { font-weight: 500; color: #cbd5e1; margin-right: 8px; }
        .field-value { color: #ffffff; }
        .highlight { background: #31af9d20; padding: 4px 8px; border-radius: 4px; color: #31af9d; font-weight: 500; }
        .timestamp { text-align: center; margin-top: 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💎 IntelliGem</div>
          <h1 class="title">🗓️ Nova Reunião Agendada</h1>
          <p class="subtitle">Uma nova reunião foi solicitada através do site</p>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="icon">👤</span>
            Dados do Cliente
          </h2>
          <div class="field">
            <span class="field-label">Nome:</span>
            <span class="field-value">${meeting.contact_name}</span>
          </div>
          <div class="field">
            <span class="field-label">E-mail:</span>
            <span class="field-value">${meeting.email}</span>
          </div>
          <div class="field">
            <span class="field-label">Empresa:</span>
            <span class="field-value">${meeting.company}</span>
          </div>
          ${meeting.phone ? `
          <div class="field">
            <span class="field-label">Telefone:</span>
            <span class="field-value">${meeting.phone}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="icon">📋</span>
            Detalhes da Reunião
          </h2>
          <div class="field">
            <span class="field-label">Solução de Interesse:</span>
            <span class="highlight">${solutionNames[meeting.interested_solution] || meeting.interested_solution}</span>
          </div>
          <div class="field">
            <span class="field-label">Tipo de Reunião:</span>
            <span class="field-value">${typeNames[meeting.meeting_type] || meeting.meeting_type}</span>
          </div>
          <div class="field">
            <span class="field-label">Horário Preferido:</span>
            <span class="field-value">${meeting.preferred_time}</span>
          </div>
        </div>

        ${meeting.specific_challenges ? `
        <div class="section">
          <h2 class="section-title">
            <span class="icon">💬</span>
            Desafios Mencionados
          </h2>
          <div class="field-value" style="line-height: 1.6;">
            ${meeting.specific_challenges.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h2 class="section-title">
            <span class="icon">📊</span>
            Informações de Origem
          </h2>
          <div class="field">
            <span class="field-label">Página de Origem:</span>
            <span class="field-value">${meeting.source_page || 'Site IntelliGem'}</span>
          </div>
          <div class="field">
            <span class="field-label">Status:</span>
            <span class="highlight">Pendente de Confirmação</span>
          </div>
        </div>

        <div class="timestamp">
          📅 Solicitação recebida em: ${new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate client email template
function generateClientEmailTemplate(meeting: any): string {
  const solutionNames = {
    'GemFlow': 'GemFlow - Automação de Processos',
    'GemInsights': 'GemInsights - Dashboards e BI',
    'GemMind': 'GemMind - Modelos de IA',
    'All': 'Todas as Nossas Soluções'
  };

  const solutionDescriptions = {
    'GemFlow': 'Automatize processos complexos, reduza tempo de execução e elimine erros manuais com nossa plataforma de automação inteligente.',
    'GemInsights': 'Transforme dados em insights acionáveis com dashboards interativos e análises avançadas de business intelligence.',
    'GemMind': 'Implemente modelos de inteligência artificial personalizados para otimizar operações e tomada de decisões.',
    'All': 'Explore todo nosso ecossistema de soluções integradas para transformação digital completa.'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reunião Agendada com Sucesso</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #31af9d, #136eae); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .title { font-size: 24px; color: #1e293b; margin: 0; }
        .subtitle { color: #64748b; margin: 8px 0 0 0; font-size: 16px; }
        .success-badge { display: inline-flex; align-items: center; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 50px; font-weight: 500; margin: 16px 0; }
        .section { margin: 24px 0; padding: 24px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #31af9d; }
        .section-title { font-size: 18px; font-weight: 600; color: #31af9d; margin: 0 0 16px 0; display: flex; align-items: center; }
        .icon { margin-right: 8px; font-size: 20px; }
        .field { margin: 12px 0; }
        .field-label { font-weight: 500; color: #475569; margin-right: 8px; }
        .field-value { color: #1e293b; font-weight: 500; }
        .highlight { background: #31af9d; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 500; display: inline-block; }
        .what-to-expect { background: #eff6ff; border-left-color: #3b82f6; }
        .what-to-expect .section-title { color: #1d4ed8; }
        .expectation-list { list-style: none; padding: 0; margin: 0; }
        .expectation-item { padding: 8px 0; display: flex; align-items: flex-start; }
        .expectation-icon { margin-right: 12px; color: #31af9d; font-weight: bold; }
        .cta-section { text-align: center; margin: 32px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #31af9d, #136eae); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .team-section { background: #fef3c7; border-left-color: #d97706; }
        .team-section .section-title { color: #92400e; }
        .footer { text-align: center; margin-top: 32px; padding: 24px; background: #f1f5f9; border-radius: 8px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💎 IntelliGem</div>
          <h1 class="title">✅ Reunião Agendada com Sucesso!</h1>
          <p class="subtitle">Obrigado por agendar uma conversa conosco!</p>
          <div class="success-badge">
            🎉 Agendamento confirmado
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="icon">📅</span>
            Resumo da Sua Reunião
          </h2>
          <div class="field">
            <span class="field-label">Nome:</span>
            <span class="field-value">${meeting.contact_name}</span>
          </div>
          <div class="field">
            <span class="field-label">Empresa:</span>
            <span class="field-value">${meeting.company}</span>
          </div>
          <div class="field">
            <span class="field-label">Data/Hora Preferida:</span>
            <span class="highlight">${meeting.preferred_time}</span>
          </div>
          <div class="field">
            <span class="field-label">Duração:</span>
            <span class="field-value">30-45 minutos</span>
          </div>
          <div class="field">
            <span class="field-label">Formato:</span>
            <span class="field-value">Online via Google Meet</span>
          </div>
          <div class="field">
            <span class="field-label">Foco:</span>
            <span class="field-value">${solutionNames[meeting.interested_solution] || meeting.interested_solution}</span>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="icon">🎯</span>
            Sobre ${solutionNames[meeting.interested_solution] || meeting.interested_solution}
          </h2>
          <p style="line-height: 1.6; color: #475569; margin: 0;">
            ${solutionDescriptions[meeting.interested_solution] || solutionDescriptions['All']}
          </p>
        </div>

        <div class="section what-to-expect">
          <h2 class="section-title">
            <span class="icon">🎯</span>
            O Que Esperar da Nossa Conversa
          </h2>
          <ul class="expectation-list">
            <li class="expectation-item">
              <span class="expectation-icon">✅</span>
              <span>Análise personalizada dos seus desafios e objetivos</span>
            </li>
            <li class="expectation-item">
              <span class="expectation-icon">✅</span>
              <span>Demonstração prática das nossas soluções</span>
            </li>
            <li class="expectation-item">
              <span class="expectation-icon">✅</span>
              <span>Estratégia customizada para sua empresa</span>
            </li>
            <li class="expectation-item">
              <span class="expectation-icon">✅</span>
              <span>Próximos passos recomendados</span>
            </li>
            <li class="expectation-item">
              <span class="expectation-icon">✅</span>
              <span>Estimativa de ROI e cronograma de implementação</span>
            </li>
          </ul>
        </div>

        <div class="section team-section">
          <h2 class="section-title">
            <span class="icon">👨‍💼</span>
            Próximos Passos
          </h2>
          <p style="line-height: 1.6; color: #475569; margin: 0;">
            Nossa equipe de especialistas entrará em contato com você 
            <strong>em até 24 horas</strong> para confirmar os detalhes finais 
            e enviar o link da reunião via Google Meet.
          </p>
        </div>

        <div class="cta-section">
          <p style="color: #64748b; margin-bottom: 16px;">
            Precisa reagendar ou tem alguma dúvida?
          </p>
          <a href="mailto:intelligemconsultoria@gmail.com?subject=Reagendamento - ${meeting.contact_name}" class="cta-button">
            Entre em Contato
          </a>
        </div>

        <div class="footer">
          <div style="font-size: 18px; margin-bottom: 8px;">
            <strong>🤝 IntelliGem - Transformando Dados em Inteligência</strong>
          </div>
          <p style="margin: 8px 0; color: #475569;">
            Especialistas em soluções de dados, automação e inteligência artificial
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            Este e-mail foi enviado para ${meeting.email}<br>
            Se você não solicitou esta reunião, pode ignorar este e-mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(app.fetch);