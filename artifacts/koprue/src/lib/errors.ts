export type FailureKind =
  | 'bad_image'
  | 'too_large'
  | 'timeout'
  | 'network'
  | 'busy'
  | 'not_configured'
  | 'bad_answer'
  | 'no_text'
  | 'bad_request'
  | 'unknown';

export interface Failure {
  kind: FailureKind;
  title: string;
  body: string;
  /** Whether sending the same request again is likely to help. */
  retry: boolean;
}

/** Read the `code` the API puts in its error body, if there is one. */
function codeOf(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const data = (err as { data?: unknown }).data;
  if (data && typeof data === 'object' && typeof (data as { code?: unknown }).code === 'string') {
    return (data as { code: string }).code;
  }
  return undefined;
}

function statusOf(err: unknown): number | undefined {
  const s = err && typeof err === 'object' ? (err as { status?: unknown }).status : undefined;
  return typeof s === 'number' ? s : undefined;
}

/**
 * Turn any failure from the interpret call into a plain-language explanation
 * and a next step. Never includes raw server messages, stack traces or keys.
 */
export function describeFailure(err: unknown): Failure {
  let code = codeOf(err);
  if (!code) {
    const status = statusOf(err);
    if (status === 413) code = 'image_too_large';
    else if (status === 429) code = 'rate_limited';
    else if (status === 504) code = 'timeout';
    else if (status === undefined) code = 'network';
  }

  switch (code) {
    case 'invalid_image':
      return { kind: 'bad_image', retry: false, title: "That image couldn't be read", body: 'Use a JPG, PNG or WebP picture of the notice. A screenshot works too. If the photo keeps failing, paste the text of the notice instead.' };
    case 'image_too_large':
      return { kind: 'too_large', retry: false, title: 'That image is too large', body: 'Choose a smaller picture or take a new photo. If it is a screenshot of a whole page, crop it to the notice. You can also paste the text.' };
    case 'timeout':
      return { kind: 'timeout', retry: true, title: 'Gemma 4 took too long', body: 'The model did not answer in time, even after an automatic second attempt. Your image is still here, so just press Try again. A closer photo of only the notice is usually faster, or paste the text.' };
    case 'network':
    case 'upstream_unavailable':
      return { kind: 'network', retry: true, title: "Couldn't reach the AI service", body: 'Check your internet connection and try again in a moment. The sample below still works offline.' };
    case 'rate_limited':
      return { kind: 'busy', retry: true, title: 'Too many requests in a short time', body: 'Wait about a minute, then try again. The sample still works while you wait.' };
    case 'quota_exceeded':
      return { kind: 'busy', retry: true, title: 'The AI service is busy', body: "Gemma 4's request limit was reached. Wait a minute or two and try again. The sample still works while you wait." };
    case 'not_configured':
      return { kind: 'not_configured', retry: false, title: "Live analysis isn't set up here", body: 'This copy of KÖPRÜ has no working Gemini API key. The interactive sample works without it.' };
    case 'bad_model_response':
      return { kind: 'bad_answer', retry: true, title: "The answer didn't come back in a usable form", body: "Gemma 4's reply was incomplete. Try again. If it keeps happening, use a clearer photo or paste the text." };
    case 'no_text_found':
      return { kind: 'no_text', retry: true, title: "No readable text was found", body: "Gemma 4 couldn't read any text in this picture. Try a sharper, closer photo with the whole notice in frame and no glare, or paste the text." };
    case 'invalid_request':
      return { kind: 'bad_request', retry: false, title: "That request wasn't valid", body: 'Paste some text or choose an image of a notice, then try again.' };
    default:
      return { kind: 'unknown', retry: true, title: 'Something went wrong', body: 'Try again in a moment. If it keeps failing, paste the text instead of uploading a photo.' };
  }
}

/** Problems found in a chosen file before anything is sent. */
export function describeFileProblem(file: { type: string; size: number }, maxBytes: number): string | null {
  if (/heic|heif/i.test(file.type)) {
    return "iPhone HEIC photos can't be read here. Use Take photo, or set the camera format to Most Compatible, or paste the text.";
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return "That file isn't a JPG, PNG or WebP image. Choose a photo or screenshot of the notice, or paste its text.";
  }
  if (file.size > maxBytes) {
    return `That image is over ${Math.round(maxBytes / (1024 * 1024))} MB. Choose a smaller picture or take a new photo.`;
  }
  return null;
}
