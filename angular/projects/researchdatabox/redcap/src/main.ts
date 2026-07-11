import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RedcapModule } from './app/redcap.module';
platformBrowserDynamic().bootstrapModule(RedcapModule).catch(error => console.error(error));
