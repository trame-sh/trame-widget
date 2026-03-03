# @trame.sh/widget

Embeddable feedback widget for [trame](https://trame.sh) - collect user feedback from your applications.

## Installation

### NPM Package

```bash
npm install @trame.sh/widget
# or
pnpm add @trame.sh/widget
```

### CDN (Script Tag)

```html
<script>
!function(w,d,i,s){function l(){if(!d.getElementById(i)){
  var f=d.getElementsByTagName(s)[0],e=d.createElement(s);
  e.type="text/javascript";e.async=true;e.id=i;
  e.src="https://unpkg.com/@trame.sh/widget/dist/cdn/trame-widget.js";
  f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Trame){
  var c=function(){c.q.push(arguments)};c.q=[];w.Trame=c;
  "complete"===d.readyState?l():w.addEventListener("load",l,false)
}}(window,document,"trame-widget-js","script");

Trame('init', {
  projectId: 'proj_abc123',
  apiKey: 'tk_pub_xxxxxxxx',
});
</script>
```

## Usage

### Basic Setup (NPM)

```typescript
import { TrameWidget } from '@trame.sh/widget';

TrameWidget.init({
  projectId: 'proj_abc123',
  apiKey: 'tk_pub_xxxxxxxx',
});
```

### Configuration Options

```typescript
TrameWidget.init({
  // Required
  projectId: 'proj_abc123',
  apiKey: 'tk_pub_xxxxxxxx',
  
  // Optional
  theme: 'auto',              // 'light' | 'dark' | 'auto'
  position: 'bottom-right',   // 'bottom-right' | 'bottom-left'
  triggerLabel: 'Feedback',
  formTitle: 'Send Feedback',
  autoInject: true,           // Auto-inject trigger button
  
  // Pre-fill user info
  user: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    id: 'usr_123',
  },
  
  // Callbacks
  onOpen: () => console.log('Widget opened'),
  onSubmit: (feedback) => console.log('Feedback submitted:', feedback),
  onError: (err) => console.error('Error:', err),
});
```

### Custom Trigger (BYOUI)

```typescript
// Don't auto-inject the default trigger
TrameWidget.init({
  projectId: 'proj_abc123',
  apiKey: 'tk_pub_xxxxxxxx',
  autoInject: false,
});

// Attach to your own button
TrameWidget.attachTo('#my-feedback-button');
```

### Programmatic Submission

```typescript
// Submit feedback without showing the form
await TrameWidget.submit({
  message: 'The save button is broken',
  user: { name: 'Jane', email: 'jane@example.com' },
  metadata: { page: '/settings', version: '2.1.0' },
});
```

### Update Configuration

```typescript
// Update config after initialization
TrameWidget.update({
  user: { name: 'New User', email: 'new@example.com' },
});
```

### Cleanup

```typescript
// Clean up widget (useful for SPAs)
TrameWidget.destroy();
```

## Features

- **Shadow DOM Isolation**: Styles don't conflict with your app
- **Lightweight**: Small bundle size with no dependencies
- **Theming**: Light, dark, and auto modes
- **Customizable**: Custom trigger, labels, and callbacks
- **Type-safe**: Full TypeScript support
- **Framework-agnostic**: Works with any JS framework

## API Endpoint

The widget submits feedback to `POST /api/feedback` with the following payload:

```json
{
  "project_id": "uuid",
  "message": "User feedback message",
  "source_url": "https://app.example.com/page",
  "user_name": "Jane Doe",
  "user_email": "jane@example.com",
  "user_external_id": "usr_123",
  "metadata": {
    "page": "/dashboard",
    "version": "2.1.0"
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Watch mode
pnpm dev
```

## License

MIT
