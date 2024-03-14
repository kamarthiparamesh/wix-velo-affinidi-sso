import { getAuthUrl } from 'public/client.js';
import wixLocationFrontend from 'wix-location-frontend';

// For Velo API Reference documentation visit https://www.wix.com/velo/reference/api-overview
// To learn about widget code visit https://support.wix.com/en/article/wix-blocks-coding-in-blocks

$w.onReady(function () {
    // Initialize your widget here. If your widget has properties, this is a good place to read their values and initialize the widget accordingly.

});

$widget.onPropsChanged((oldProps, newProps) => {
    // If your widget has properties, onPropsChanged is where you should handle changes to their values.
    // Property values can change at runtime by code written on the site, or when you preview your widget here in the App Builder.

});


/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export async function affinidiLogin_click(event) {
	$w('#affinidiLogin').disable();
    console.log('Affinidi Login button clicked');
    try {
        const url = await getAuthUrl();
        wixLocationFrontend.to(url);

    } catch (error) {
        console.error(error);
        $w('#affinidiLogin').enable();
    }
}