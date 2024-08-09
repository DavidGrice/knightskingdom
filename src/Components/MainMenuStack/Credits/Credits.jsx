import React from "react";
import styles from './Credits.module.css'
import Checkmark2 from './CreditsResourceStack/checkmark_2.png';
import Checkmark4 from './CreditsResourceStack/checkmark_4.png';
import { CommonComponent } from "../../Common";

const Credits = ( { navigateToMenu }) => {

    const handleCheckmarkClick = () => {
        navigateToMenu();
    }

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.textScrollDiv}>
                <div className={styles.textScroll}>
                    <h1>Credits</h1>
                    <br></br>
                    <h2>Developers</h2>
                    <br></br>
                    <p>David Grice</p>
                    <br></br>
                    <h2>Special Thanks</h2>
                    <br></br>
                    <h3>Asset Extraction</h3>
                    <br></br>
                    <p>Aluigi</p>
                    <br></br>
                    <h3>Discord Helpers</h3>
                    <br></br>
                    <p>ZDev</p>
                    <p>tjoener</p>
                    <p>RED_EYE</p>
                    <p>Mr.Mouse</p>
                    <p>RichWhitehouse</p>
                    <p>Lofty</p>
                    <p>blackninja</p>
                    <p>Evil Commander</p>
                    <br></br>
                    <h3>Original Creators</h3>
                    <br></br>
                    <p>Rich Hill</p>
                    <p>Paul Grimster</p>
                    <br></br>
                    {/* <h3>Original Credits</h3>
                    <p>LEGO Creator Knights' Kingdom</p>
                    <h2>Contributors</h2>
                    <p>Original Concept and Game Design</p>
                    <p>Geoff Smith</p>
                    <p>Paul Grimster</p>
                    <p>Sonja Kristensen</p>
                    <p>John Temperton</p>
                    <p>Stefan von Cavallar</p>
                    <p>Producer</p>
                    <p>Ian Johnson</p>
                    <p>Developed By</p>
                    <p>Superscape Professional Services</p>
                    <p>Project Management</p>
                    <p>Geoff Smith</p>
                    <p>Project Consultancy & Coordination</p>
                    <p>David Wright</p>
                    <p>Karen Evans</p>
                    <p>Steve Mortara</p>
                    <p>Dave Griffith</p>
                    <p>3D Programming</p>
                    <p>Paul Grimster</p>
                    <p>Chris Andrew</p>
                    <p>Evangelos Ginis</p>
                    <p>Rich Hill</p>
                    <p>Graphic Design</p>
                    <p>John Temperton (Lead)</p>
                    <p>Sonja Kristensen</p>
                    <p>Darren Farmer</p>
                    <p>Rak Patel</p>
                    <p>Interface Design</p>
                    <p>Sonja Kristensen (Lead)</p>
                    <p>John Temperton</p>
                    <p>Interface Programming</p>
                    <p>Stefan von Cavallar (Lead)</p>
                    <p>Evangelos Ginis</p>
                    <p>Installer</p>
                    <p>Rich Hill</p>
                    <p>3D Geometry and Design</p>
                    <p>Simon Meacock (Lead)</p>
                    <p>Damon Reid</p>
                    <p>Character Animation</p>
                    <p>Rich Self</p>
                    <p>Help and Challenges</p>
                    <p>Ian Meredith</p>
                    <p>Geoff Smith</p>
                    <p>Chris Andrew</p>
                    <p>James Davis</p>
                    <p>Digitext</p>
                    <p>Sound Design</p>
                    <p>Ian Livingstone</p>
                    <p>Media Themes and Sound Design</p>
                    <p>Music</p>
                    <p>David Puncheon and Richard Wells</p>
                    <p>English Voiceover</p>
                    <p>Peter Dickson</p>
                    <p>Superscape Testing</p>
                    <p>Karen Evans</p>
                    <p>Patrick Glithro</p>
                    <p>Gordon Waldie</p>
                    <p>James Townsend</p>
                    <p>Kendra Bingham</p>
                    <p>LEGO Testing</p>
                    <p>Kevin Turner (Global Head of Q.A.)</p>
                    <p>Gary Simmons (QA Group Lead)</p>
                    <p>Nick Bodenham (Lead Test)</p>
                    <p>Neil Delderfield</p>
                    <p>Karl Fentiman</p>
                    <p>Stephen Manners</p>
                    <p>Matthew Marriner</p>
                    <p>Powered by</p>
                    <p>Superscape Technology</p> */}
                </div>
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={Checkmark2} 
                    hoverImage={Checkmark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>
        </div>
    );
};

export default Credits;