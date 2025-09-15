import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { FlyerData, ExportOptions, Show, LegacyShow } from '../types';
import { convertShowToFlyerData, convertLegacyShowToFlyerData, getMonthFromDate } from '../utils/flyerUtils';

export class FlyerGenerator {
  private static async createFlyerCanvas(
    flyerData: FlyerData, 
    width: number, 
    height: number,
    elementId?: string
  ): Promise<HTMLCanvasElement> {
    // Create a temporary div for rendering
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div id="temp-flyer-${Date.now()}" class="flyer-preview" style="
        width: 300px;
        height: 300px;
        position: absolute;
        left: -9999px;
        top: -9999px;
        background-color: #231F20;
        color: #caa12b;
        font-family: 'Oswald', Impact, 'Arial Narrow', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: center;
        padding: 15px;
        overflow: hidden;
        border-radius: 0px;
        border: none;
        box-shadow: none;
        z-index: 9999;
      ">
        <div class="flyer-content" style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        ">
          <header style="text-align: center; margin-bottom: 15px;">
            <img src="/logo.png" alt="Matt Monroe Logo" style="width: 120px; height: auto; display: block;" />
          </header>
          
          <section style="text-align: center; margin: 5px 0; font-size: 30px; line-height: .95; font-weight: 900; color: #caa12b;">
            ${flyerData.date}
          </section>
          
          <section style="text-align: center; margin: 5px 0; font-size: 27px; line-height: .95; font-weight: 900; color: #caa12b;">
            ${flyerData.venueName}
          </section>
          
          <section style="text-align: center; margin: 5px 0; font-size: 18px; line-height: 1.02; font-weight: 900; color: #f2f2f2;">
            ${flyerData.venueAddress}${flyerData.cityState ? '<br/>' + flyerData.cityState : ''}
          </section>
          
          <section style="text-align: center; margin: 5px 0; font-size: 18px; line-height: 1.02; font-weight: 900; color: #f2f2f2;">
            ${flyerData.showTime}
          </section>
          
          <section style="text-align: center; margin: 5px 0; font-size: 15px; line-height: 1.05; font-weight: 900; color: #caa12b;">
            ${flyerData.eventType}
          </section>
        </div>
      </div>
    `;
    
    const tempFlyer = tempDiv.firstElementChild as HTMLElement;
    document.body.appendChild(tempDiv);
    
    try {
      // Wait a moment for the element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use html2canvas to render the flyer at maximum resolution
      const canvas = await html2canvas(tempFlyer, {
        width: 300,
        height: 300,
        scale: 8, // 8x resolution for maximum quality
        backgroundColor: '#231F20',
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 30000
      });
      
      // Create the final canvas with desired dimensions
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      
      if (!finalCtx) {
        throw new Error('Could not get canvas context');
      }
      
      finalCanvas.width = width;
      finalCanvas.height = height;

      // Enable image smoothing for better quality
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';

      // Fill background with exact color
      finalCtx.fillStyle = '#231F20';
      finalCtx.fillRect(0, 0, width, height);

      // Calculate scaling to maintain aspect ratio
      const scaleX = width / 300;
      const scaleY = height / 300;
      const finalScale = Math.min(scaleX, scaleY);
      
      // Calculate centering offsets - move content slightly to the left
      const offsetX = (width - (300 * finalScale)) / 2 - (20 * finalScale); // Move 20px left
      const offsetY = (height - (300 * finalScale)) / 2;

      // Draw the flyer content centered
      finalCtx.drawImage(canvas, offsetX, offsetY, 300 * finalScale, 300 * finalScale);

      return finalCanvas;
    } finally {
      // Clean up
      document.body.removeChild(tempDiv);
    }
  }

  static async exportSingleFlyer(
    flyerData: FlyerData, 
    options: ExportOptions
  ): Promise<void> {
    try {
      const canvas = await this.createFlyerCanvas(flyerData, options.width, options.height);
      
      // Export as PNG with maximum quality
      const link = document.createElement('a');
      const fileName = `flyer-${flyerData.venueName.replace(/[^a-zA-Z0-9]/g, '-')}-${flyerData.date.replace(/[^a-zA-Z0-9]/g, '-')}-${options.platform}-${Date.now()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
      link.click();
    } catch (error) {
      console.error('Error exporting single flyer:', error);
      throw error;
    }
  }

  // Overloaded methods for different show types
  static async exportAllFlyers(
    shows: Show[], 
    platform: 'instagram' | 'facebook'
  ): Promise<void>;
  static async exportAllFlyers(
    shows: LegacyShow[], 
    platform: 'instagram' | 'facebook'
  ): Promise<void>;
  static async exportAllFlyers(
    shows: Show[] | LegacyShow[], 
    platform: 'instagram' | 'facebook'
  ): Promise<void> {
    try {
      const zip = new JSZip();
      const processedShows = new Set<string>(); // Track processed shows to avoid duplicates
      
      const width = platform === 'instagram' ? 1080 : 1200;
      const height = platform === 'instagram' ? 1080 : 630;
      
      for (const show of shows) {
        // Check if it's a LegacyShow or Show
        const isLegacyShow = 'Date' in show && 'Venue Name' in show;
        
        const date = isLegacyShow ? (show as LegacyShow).Date : (show as Show).date;
        const venueName = isLegacyShow ? (show as LegacyShow)['Venue Name'] : (show as Show).venue_name;
        
        if (!date || processedShows.has(date + venueName)) {
          continue;
        }
        processedShows.add(date + venueName);
        
        // Determine month from date
        const month = getMonthFromDate(date);
        const monthFolder = month || 'Unknown Month';
        
        // Convert show to flyer data
        const flyerData = isLegacyShow 
          ? convertLegacyShowToFlyerData(show as LegacyShow)
          : convertShowToFlyerData(show as Show);
        
        // Create flyer image
        const canvas = await this.createFlyerCanvas(flyerData, width, height);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png', 1.0);
        });
        
        // Add to zip with month organization
        const fileName = `flyer-${(venueName || 'venue').replace(/[^a-zA-Z0-9]/g, '-')}-${(date || 'date').replace(/[^a-zA-Z0-9]/g, '-')}-${platform}.png`;
        zip.file(`${monthFolder}/${fileName}`, blob);
      }
      
      // Generate and download zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${platform}-flyers-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      
    } catch (error) {
      console.error('Error creating zip file:', error);
      throw error;
    }
  }
}

